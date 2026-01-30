import { storage } from "../server/storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import "dotenv/config";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function main() {
    console.log("Seeding database...");

    const existingUsers = await storage.getUserByUsername("admin");
    let userId: number;

    if (!existingUsers) {
        console.log("Creating admin user...");
        const hashedPassword = await hashPassword("admin123");
        const user = await storage.createUser({
            username: "admin",
            password: hashedPassword,
            firstName: "Admin",
            lastName: "User",
            profileImageUrl: null
        });
        userId = user.id;
        console.log("Created admin user (password: admin123)");
    } else {
        console.log("Admin user exists.");
        userId = existingUsers.id;
    }

    const projects = await storage.getProjects();
    if (projects.length === 0) {
        console.log("Creating welcome project...");

        const project = await storage.createProject({
            name: "Welcome Project",
            description: "This is a sample project to get you started.",
            status: "active",
            startDate: new Date(),
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
            ownerId: userId
        });

        await storage.createTask({
            projectId: project.id,
            title: "Explore the dashboard",
            description: "Check out the project statistics and activity feed.",
            status: "done",
            priority: "high",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
            assigneeId: userId
        });

        await storage.createTask({
            projectId: project.id,
            title: "Create your first project",
            description: "Click the 'New Project' button to start managing your own work.",
            status: "todo",
            priority: "medium",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            assigneeId: userId
        });

        await storage.createActivityLog({
            action: "system_init",
            details: "System initialized with sample data",
            projectId: project.id,
            userId: userId
        });
    } else {
        console.log("Projects already exist.");
    }

    console.log("Seeding complete.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
