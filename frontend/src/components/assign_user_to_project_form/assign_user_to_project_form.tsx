"use client";

import { useEffect, useState } from "react";

import { createAssociate, getAssociatesByProjectId } from "../../api/associates";
import { getAllProjects, type Project } from "../../api/projects";
import { getAllUsers, type User } from "../../api/users";
import styles from "./assign_user_to_project_form.module.css";

type AssignUserToProjectFormProps = {
    onAssignmentAdded?: () => void;
};

export default function AssignUserToProjectForm({
    onAssignmentAdded,
}: AssignUserToProjectFormProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [projectId, setProjectId] = useState("");
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const loadData = async () => {
            const [allProjects, allUsers] = await Promise.all([
                getAllProjects(),
                getAllUsers(),
            ]);

            setProjects(allProjects);
            setUsers(allUsers);
        };

        void loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!projectId || !userId) {
            alert("Please select both a project and a user.");
            return;
        }

        try {
            const existingAssociates = await getAssociatesByProjectId(Number(projectId));
            const alreadyAssigned = existingAssociates.some(
                (associate) => associate.associate_id === Number(userId),
            );

            if (alreadyAssigned) {
                alert("This user is already assigned to this project.");
                return;
            }

            await createAssociate({
                project_id: Number(projectId),
                associate_id: Number(userId),
            });

            setProjectId("");
            setUserId("");

            onAssignmentAdded?.();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to assign user.");
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2>Assign User to Project</h2>

            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                <option value="">Select project</option>
                {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                        {project.project_name}
                    </option>
                ))}
            </select>

            <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
                <option value="">Select user</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.user_name}
                    </option>
                ))}
            </select>

            <button type="submit">Assign User</button>
        </form>
    );
}
