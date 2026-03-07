import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyUser } from '../_shared/auth.ts'

interface MergeRequest {
  urls: string[]
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

    // Dynamically import pdf-lib
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1')

    const mergedPdf = await PDFDocument.create()

    for (const url of urls) {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          console.log(`[MERGE] Failed to fetch ${url}: ${response.status}`)
          continue
        }

        const contentType = response.headers.get('content-type') || ''
        const pdfBytes = await response.arrayBuffer()

        if (contentType.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
          const srcDoc = await PDFDocument.load(pdfBytes)
          const pages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices())
          for (const page of pages) {
            mergedPdf.addPage(page)
          }
        } else {
          // Try to load as PDF anyway (some carriers return PDF without proper content-type)
          try {
            const srcDoc = await PDFDocument.load(pdfBytes)
            const pages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices())
            for (const page of pages) {
              mergedPdf.addPage(page)
            }
          } catch {
            console.log(`[MERGE] Skipping non-PDF content from ${url}`)
          }
        }
      } catch (err) {
        console.log(`[MERGE] Error processing ${url}:`, err)
      }
    }

    if (mergedPdf.getPageCount() === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid PDF pages could be extracted from the provided URLs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mergedBytes = await mergedPdf.save()

    return new Response(mergedBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="labels-merged.pdf"',
      },
    })
  } catch (err) {
    console.error('[MERGE] Error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
