"use client";

import { useEffect, useState } from "react";

import { createAssociate } from "../../api/associates";
import { createProject } from "../../api/projects";
import { getAllUsers, type User } from "../../api/users";
import styles from "./add_project_form.module.css";

export default function AddProjectForm({
    onProjectAdded,
}: {
    onProjectAdded?: () => void;
}) {
    const [users, setUsers] = useState<User[]>([]);
    const [projectName, setProjectName] = useState("");
    const [managerId, setManagerId] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const loadUsers = async () => {
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        };

        void loadUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!projectName || !managerId) {
            alert("Please complete all required fields.");
            return;
        }

        try {
            const project = await createProject(
                projectName,
                Number(managerId),
                description,
            );

            await createAssociate({
				project_id: project.id,
				associate_id: Number(managerId),
			});

            setProjectName("");
            setManagerId("");
            setDescription("");

            onProjectAdded?.();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to create project.");
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2>Add Project</h2>

            <input
                type="text"
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
            />

            <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                required
            >
                <option value="">Select manager</option>

                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.user_name}
                    </option>
                ))}
            </select>

            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit">
                Create Project
            </button>
        </form>
    );
}