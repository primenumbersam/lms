import { sign } from 'hono/jwt'

async function generate() {
  const secret = "2+2LCOo0jwRlO/3oZ5nsNaZUX/3bAbwCeKhPNyNenws="
  const token = await sign(
    {
      id: "admin-id",
      email: "admin@example.com",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
    },
    secret
  )
  console.log(token)
}

generate()
