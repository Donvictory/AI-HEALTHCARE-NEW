import { faker } from "@faker-js/faker";
import { MongooseRepository } from "@/utils/crud.util";
import { IUser } from "@/modules/user/user.model";
import { UserRole } from "@/modules/user/user.entity";

export const generateUsers = async (
  count: number,
  repo: MongooseRepository<IUser>,
  hashedPassword: string,
) => {
  const users = [];

  // Always create at least one of each role to ensure coverage
  const fixedRoles = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.DOCTOR,
    UserRole.PATIENT,
  ];

  for (let i = 0; i < count; i++) {
    // Pick from fixed roles first, then randomize
    const role =
      i < fixedRoles.length
        ? fixedRoles[i]
        : faker.helpers.arrayElement(Object.values(UserRole));

    // Special email for super admin to easily log in
    const email =
      role === UserRole.SUPER_ADMIN && i === 0
        ? "admin@example.com"
        : faker.internet.email().toLowerCase();

    const user = await repo.create({
      name: faker.person.fullName(),
      email: email,
      password: hashedPassword,
      role: role,
      isActive: true,
    });
    users.push(user);
  }
  return users;
};
