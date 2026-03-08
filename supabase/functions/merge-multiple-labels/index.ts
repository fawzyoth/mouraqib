import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'

interface MergeRequest {
  urls: string[]
}

function isNavexUrl(url: string): boolean {
  return url.includes('navex.tn')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user } = await verifyUser(req.headers.get('Authorization'))
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { urls } = (await req.json()) as MergeRequest

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'urls array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Separate Navex HTML URLs from PDF URLs
    const pdfUrls = urls.filter(u => !isNavexUrl(u))
    const navexUrls = urls.filter(u => isNavexUrl(u))

    console.log(`[MERGE] ${pdfUrls.length} PDF URLs, ${navexUrls.length} Navex URLs`)

    // If all URLs are Navex, return combined HTML
    // If mixed or all PDFs, merge PDFs and return Navex as separate HTML pages
    const htmlPages: string[] = []
    for (const url of navexUrls) {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          console.log(`[MERGE] Failed to fetch Navex ${url}: ${response.status}`)
          continue
        }
        const html = await response.text()
        htmlPages.push(html)
        console.log(`[MERGE] Fetched Navex HTML from ${url} (${html.length} chars)`)
      } catch (err) {
        console.log(`[MERGE] Error fetching Navex ${url}:`, err)
      }
    }

    // If we have PDF URLs, merge them
    let mergedPdfBytes: Uint8Array | null = null
    if (pdfUrls.length > 0) {
      const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1')
      const mergedPdf = await PDFDocument.create()

      for (const url of pdfUrls) {
        try {
          const response = await fetch(url)
          if (!response.ok) {
            console.log(`[MERGE] Failed to fetch ${url}: ${response.status}`)
            continue
          }

          const pdfBytes = await response.arrayBuffer()
          try {
            const srcDoc = await PDFDocument.load(pdfBytes)
            const pages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices())
            for (const page of pages) {
              mergedPdf.addPage(page)
            }
          } catch {
            console.log(`[MERGE] Skipping non-PDF content from ${url}`)
          }
        } catch (err) {
          console.log(`[MERGE] Error processing ${url}:`, err)
        }
      }

      if (mergedPdf.getPageCount() > 0) {
        mergedPdfBytes = await mergedPdf.save()
      }
    }

    // Return based on what we have
    if (htmlPages.length > 0 && !mergedPdfBytes) {
      // All Navex: return combined HTML with page breaks
      const combinedHtml = buildCombinedHtml(htmlPages)
      return new Response(combinedHtml, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    if (mergedPdfBytes && htmlPages.length === 0) {
      // All PDFs: return merged PDF
      return new Response(mergedPdfBytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="labels-merged.pdf"',
        },
      })
    }

    if (mergedPdfBytes && htmlPages.length > 0) {
      // Mixed: return JSON with both
      const pdfBase64 = btoa(String.fromCharCode(...mergedPdfBytes))
      const combinedHtml = buildCombinedHtml(htmlPages)
      return new Response(
        JSON.stringify({ pdf: pdfBase64, html: combinedHtml }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'No valid labels could be fetched from the provided URLs' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[MERGE] Error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Extract the <body> content from an HTML page, or return the full HTML if no body tag.
 */
function extractBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return bodyMatch ? bodyMatch[1] : html
}

/**
 * Extract <style> and <link rel="stylesheet"> from an HTML page's <head>.
 */
function extractStyles(html: string): string {
  const styles: string[] = []
  // Inline <style> blocks
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let match
  while ((match = styleRegex.exec(html)) !== null) {
    styles.push(`<style>${match[1]}</style>`)
  }
  // <link rel="stylesheet"> tags
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi
  while ((match = linkRegex.exec(html)) !== null) {
    styles.push(match[0])
  }
  return styles.join('\n')
}

/**
 * Combine multiple HTML pages into a single printable HTML document with page breaks.
 */
function buildCombinedHtml(pages: string[]): string {
  const allStyles = pages.map(extractStyles).join('\n')
  const bodies = pages.map(extractBody)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Labels</title>
  ${allStyles}
  <style>
    @media print {
      .label-page { page-break-after: always; }
      .label-page:last-child { page-break-after: avoid; }
    }
    .label-page {
      page-break-after: always;
      margin: 0;
      padding: 0;
    }
    .label-page:last-child {
      page-break-after: avoid;
    }
  </style>
</head>
<body>
  ${bodies.map((body, i) => `<div class="label-page">${body}</div>`).join('\n')}
</body>
</html>`
}
