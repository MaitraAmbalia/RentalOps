const { prisma } = require("../config/db");

const create = async (data) => {
  return prisma.refreshToken.create({ data });
};

const findByToken = async (token) => {
  return prisma.refreshToken.findUnique({ where: { token } });
};

const update = async (id, data) => {
  return prisma.refreshToken.update({
    where: { id },
    data,
  });
};

const revokeAllForSubject = async (subjectId, subjectType) => {
  return prisma.refreshToken.updateMany({
    where: { subjectId, subjectType, revoked: false },
    data: { revoked: true },
  });
};

module.exports = {
  create,
  findByToken,
  update,
  revokeAllForSubject,
};
