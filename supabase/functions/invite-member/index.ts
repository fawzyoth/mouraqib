import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient } from '../_shared/supabase.ts'
import { verifyUser, hasRole } from '../_shared/auth.ts'

interface InviteRequest {
  email: string
  name: string
  password: string
  role: string
  boutiqueIds?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify caller is owner/admin
    const user = await verifyUser(req.headers.get('Authorization'))
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!hasRole(user, ['owner', 'manager'])) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: only owners and managers can invite members' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse request
    const body: InviteRequest = await req.json()
    const { email, name, password, role, boutiqueIds } = body

    if (!email || !role || !password || !name) {
      return new Response(
        JSON.stringify({ error: 'Name, email, password and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    const validRoles = ['manager', 'agent_confirmation', 'agent_warehouse']
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createServiceClient()

    // 3. Check if user already exists in the org
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .eq('organization_id', user.organizationId)
      .maybeSingle()

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'This user is already a member of your organization' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Create user with password via Supabase Auth admin API
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so they can log in immediately
      user_metadata: {
        name,
        invited_by: user.id,
        organization_id: user.organizationId,
        role,
      },
    })

    if (createError) {
      // If user already exists in auth but not in this org, just create profile
      if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const existingUser = users?.find((u: any) => u.email === email)

        if (existingUser) {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              organization_id: user.organizationId,
              name: existingUser.user_metadata?.name ?? name ?? email.split('@')[0],
              email,
              role,
              is_admin: false,
            })
            .select()
            .single()

          if (profileError) {
            return new Response(
              JSON.stringify({ error: 'Failed to create profile', details: profileError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          if (boutiqueIds && boutiqueIds.length > 0) {
            await supabase.from('profile_boutiques').insert(
              boutiqueIds.map(bid => ({
                profile_id: newProfile.id,
                boutique_id: bid,
              }))
            )
          }

          return new Response(
            JSON.stringify({ profileId: newProfile.id, inviteSent: false, existingUser: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: createError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Create profile for the new user
    if (createData.user) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: createData.user.id,
          organization_id: user.organizationId,
          name,
          email,
          role,
          is_admin: false,
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // 6. Assign boutiques if specified
      if (newProfile && boutiqueIds && boutiqueIds.length > 0) {
        await supabase.from('profile_boutiques').insert(
          boutiqueIds.map(bid => ({
            profile_id: newProfile.id,
            boutique_id: bid,
          }))
        )
      }

      // 7. Log activity
      await supabase.from('activity_logs').insert({
        organization_id: user.organizationId,
        user_id: user.id,
        type: 'settings',
        message: `Created member ${name} (${email}) as ${role}`,
        entity_type: 'profile',
        entity_id: newProfile?.id,
      })

      return new Response(
        JSON.stringify({ profileId: newProfile?.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unexpected: no user returned from create' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
