async function hashPassword(password) {
  if (!password) return null;
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // GET applications count
    if (url.pathname === "/api/applications-count") {

      const result = await env.seeds_of_success
        .prepare("SELECT COUNT(*) as count FROM volunteer_applications")
        .first();

      return Response.json(
        {
          success: true,
          applications: result.count
        },
        {
          headers: corsHeaders
        }
      );
    }

    // SAVE APPLICATION
    if (
      url.pathname === "/api/application" &&
      request.method === "POST"
    ) {
      try {

        const data = await request.json();

        await env.seeds_of_success
          .prepare(`
            INSERT INTO volunteer_applications (
              id,
              full_name,
              email,
              phone,
              role,
              skills,
              message,
              password_hash,
              status,
              created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          .bind(
            crypto.randomUUID(),
            data.full_name,
            data.email,
            data.phone,
            data.role,
            data.skills,
            data.message,
            await hashPassword(data.password || ""),
            "pending",
            new Date().toISOString()
          )
          .run();

        return Response.json(
          {
            success: true,
            message: "Application submitted successfully"
          },
          {
            headers: corsHeaders
          }
        );

      } catch (error) {

        return Response.json(
          {
            success: false,
            error: error.message
          },
          {
            status: 500,
            headers: corsHeaders
          }
        );
      }
    }

    // TUTOR SIGNUP
if (
  url.pathname === "/api/tutor-signup" &&
  request.method === "POST"
) {

  try {

    const data = await request.json();

    await env.seeds_of_success
      .prepare(`
        INSERT INTO tutor_accounts (
          id,
          full_name,
          email,
          phone,
          skills,
          availability,
          password,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        data.full_name,
        data.email,
        data.phone,
        data.skills,
        data.availability,
        data.password,
        "pending",
        new Date().toISOString()
      )
      .run();

    return Response.json(
      {
        success: true,
        message: "Tutor account created"
      },
      {
        headers: corsHeaders
      }
    );

  } catch (error) {

    return Response.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );

  }
}

    return Response.json(
      {
        success: true,
        message: "Seeds of Success API"
      },
      {
        headers: corsHeaders
      }
    );
  }

};    // We still provide endpoints but they will return empty arrays until you create those tables.

