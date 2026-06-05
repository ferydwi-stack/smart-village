package middleware

import "github.com/gofiber/fiber/v2"

// AdminRequired is a middleware that requires the user to have the 'admin' role
func AdminRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("role")
		if role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Admin privileges required",
			})
		}

		return c.Next()
	}
}
