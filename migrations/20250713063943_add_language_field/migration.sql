-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pokemon" (
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
    "language" INTEGER NOT NULL DEFAULT 2,
    "saveid" TEXT,
    "legal" BOOLEAN NOT NULL DEFAULT true,
    "legalreason" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractedtime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pokemon_saveid_fkey" FOREIGN KEY ("saveid") REFERENCES "Save" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pokemon" ("data", "evs", "exp", "extractedtime", "gender", "generation", "hometracker", "id", "ivs", "legal", "legalreason", "nickname", "ot", "saveid", "species", "speciesid", "timestamp", "type") SELECT "data", "evs", "exp", "extractedtime", "gender", "generation", "hometracker", "id", "ivs", "legal", "legalreason", "nickname", "ot", "saveid", "species", "speciesid", "timestamp", "type" FROM "Pokemon";
DROP TABLE "Pokemon";
ALTER TABLE "new_Pokemon" RENAME TO "Pokemon";
CREATE UNIQUE INDEX "Pokemon_id_key" ON "Pokemon"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
