export default {
  schema: 'prisma/schema',
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://admin:admin@localhost:5433/planner_financas?schema=public',
  },
};
