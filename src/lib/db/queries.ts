import { db } from './index';
import { users, posts, type NewUser, type NewPost } from './schema';
import { eq } from 'drizzle-orm';

// Example CRUD operations

// Create a new user
export async function createUser(userData: NewUser) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
}

// Get user by email
export async function getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
}

// Get all users
export async function getAllUsers() {
    return await db.select().from(users);
}

// Update user
export async function updateUser(id: number, userData: Partial<NewUser>) {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
}

// Delete user
export async function deleteUser(id: number) {
    await db.delete(users).where(eq(users.id, id));
}

// Create a new post
export async function createPost(postData: NewPost) {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
}

// Get all posts with author information
export async function getPostsWithAuthors() {
    return await db
        .select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            published: posts.published,
            createdAt: posts.createdAt,
            author: {
                id: users.id,
                name: users.name,
                email: users.email,
            },
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id));
}
