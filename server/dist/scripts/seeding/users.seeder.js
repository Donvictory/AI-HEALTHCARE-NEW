"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUsers = void 0;
const faker_1 = require("@faker-js/faker");
const user_entity_1 = require("../../modules/user/user.entity");
const generateUsers = async (count, repo, hashedPassword) => {
    const users = [];
    // Always create at least one of each role to ensure coverage
    const fixedRoles = [
        user_entity_1.UserRole.SUPER_ADMIN,
        user_entity_1.UserRole.ADMIN,
        user_entity_1.UserRole.MANAGER,
        user_entity_1.UserRole.DOCTOR,
        user_entity_1.UserRole.PATIENT,
    ];
    for (let i = 0; i < count; i++) {
        // Pick from fixed roles first, then randomize
        const role = i < fixedRoles.length
            ? fixedRoles[i]
            : faker_1.faker.helpers.arrayElement(Object.values(user_entity_1.UserRole));
        // Special email for super admin to easily log in
        const email = role === user_entity_1.UserRole.SUPER_ADMIN && i === 0
            ? "admin@example.com"
            : faker_1.faker.internet.email().toLowerCase();
        const user = await repo.create({
            name: faker_1.faker.person.fullName(),
            email: email,
            password: hashedPassword,
            role: role,
            isActive: true,
        });
        users.push(user);
    }
    return users;
};
exports.generateUsers = generateUsers;
