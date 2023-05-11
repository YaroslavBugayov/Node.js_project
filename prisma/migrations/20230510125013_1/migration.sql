/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "password" VARCHAR(1000) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_username_key" ON "profile"("username");
