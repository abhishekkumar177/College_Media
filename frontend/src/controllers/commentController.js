// Controller to handle posting a comment
import prisma from "../prisma/client.js";

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Assuming you have auth middleware

    // If using a raw SQL query or an ORM like Prisma/Sequelize:
    // INSERT INTO "Comment" (content, "postId", "userId") VALUES ($1, $2, $3)
    const newComment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId), // Ensure this matches your DB type (Int vs String)
        userId: userId,
      },
      include: { user: true } // Include user details to show in the UI immediately
    });

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};