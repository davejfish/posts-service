-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);
