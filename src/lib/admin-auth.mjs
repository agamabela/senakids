export async function ensureDefaultAdminUser({ prisma, bcrypt, email, password }) {
  const adminEmail = email || process.env.ADMIN_EMAIL || "admin@senakids.com";
  const adminPassword = password || process.env.ADMIN_PASSWORD || "SenaKids2024!Secure";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        emailVerified: new Date(),
      },
    });

    return { created: true, email: adminEmail };
  }

  if (existingAdmin.role !== "admin") {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin" },
    });
  }

  return { created: false, email: adminEmail };
}
