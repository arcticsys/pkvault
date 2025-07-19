-- CreateTable
CREATE TABLE "Pokemon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" BLOB NOT NULL,
    "generation" INTEGER NOT NULL,
    "speciesid" INTEGER NOT NULL,
    "species" JSONB NOT NULL,
    "nickname" TEXT,
    "gender" INTEGER NOT NULL,
    "exp" INTEGER NOT NULL,
    "evs" JSONB NOT NULL,
    "ivs" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "ot" TEXT NOT NULL,
    "hometracker" TEXT,
    "saveid" TEXT,
    "legal" BOOLEAN NOT NULL DEFAULT true,
    "legalreason" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractedtime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pokemon_saveid_fkey" FOREIGN KEY ("saveid") REFERENCES "Save" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Save" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" BLOB NOT NULL,
    "filepath" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractedtime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PokemonGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_pkmgroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_pkmgroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Pokemon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_pkmgroup_B_fkey" FOREIGN KEY ("B") REFERENCES "PokemonGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_id_key" ON "Pokemon"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Save_id_key" ON "Save"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Save_filepath_key" ON "Save"("filepath");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonGroup_id_key" ON "PokemonGroup"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_pkmgroup_AB_unique" ON "_pkmgroup"("A", "B");

-- CreateIndex
CREATE INDEX "_pkmgroup_B_index" ON "_pkmgroup"("B");
