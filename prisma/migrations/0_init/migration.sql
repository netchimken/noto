-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "authorId" INTEGER NOT NULL,
    "authorName" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pinned" INTEGER,
    "admin" BOOLEAN,
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loginAt" TIMESTAMPTZ(3),
    "email" TEXT,
    "secret" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Author_secret_key" ON "Author"("secret");

-- CreateIndex
CREATE UNIQUE INDEX "Author_id_name_key" ON "Author"("id", "name");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_authorName_fkey" FOREIGN KEY ("authorId", "authorName") REFERENCES "Author"("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

