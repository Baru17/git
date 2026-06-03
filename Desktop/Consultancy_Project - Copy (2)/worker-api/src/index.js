export default {
  async fetch(request, env) {

    const url = new URL(request.url);

	if (url.pathname === "/api/test-insert") {

  const result = await env.seeds_of_success
    .prepare(`
      INSERT INTO tutor_applications (
        id,
        full_name,
        email,
        phone,
        role,
        skills,
        message,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      crypto.randomUUID(),
      "Test User",
      "test@test.com",
      "1234567890",
      "Tutor",
      "HTML,CSS",
      "Testing insert",
      "pending",
      new Date().toISOString()
    )
    .run();

  return Response.json({
    success: true,
    result
  });
}

    // GET applications count
    if (url.pathname === "/api/applications-count") {

      const result = await env.seeds_of_success
        .prepare("SELECT COUNT(*) as count FROM tutor_applications")
        .first();

      return Response.json({
        success: true,
        applications: result.count
      });
    }

    // SAVE APPLICATION
    if (
      url.pathname === "/api/application" &&
      request.method === "POST"
    ) {
      try {

        const data = await request.json();

        const result = await env.seeds_of_success
          .prepare(`
            INSERT INTO tutor_applications (
              id,
              full_name,
              email,
              phone,
              role,
              skills,
              message,
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
            data.role,
            data.skills,
            data.message,
            "pending",
            new Date().toISOString()
          )
          .run();

        return Response.json({
          success: true,
          message: "Application submitted successfully",
          result
        });

      } catch (error) {

        return Response.json({
          success: false,
          error: String(error),
          message: error.message
        }, {
          status: 500
        });

      }
    }

    // Default route
    return Response.json({
      success: true,
      message: "Seeds of Success API"
    });
  }
};