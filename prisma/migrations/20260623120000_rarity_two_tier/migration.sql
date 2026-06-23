-- CreateEnum
CREATE TYPE "TreeRarity" AS ENUM ('comun', 'poco_comun', 'raro', 'epico', 'legendario');

-- AlterTable: añadir columna de rareza (nullable temporalmente para poder poblarla)
ALTER TABLE "templates" ADD COLUMN "rarity" "TreeRarity";

-- Migración de datos: convertir la probabilidad numérica anterior (1-25) a la
-- rareza correspondiente, usando los mismos rangos del sistema previo.
UPDATE "templates" SET "rarity" = CASE
  WHEN "probability" BETWEEN 1 AND 2 THEN 'legendario'::"TreeRarity"
  WHEN "probability" BETWEEN 3 AND 5 THEN 'epico'::"TreeRarity"
  WHEN "probability" BETWEEN 6 AND 10 THEN 'raro'::"TreeRarity"
  WHEN "probability" BETWEEN 11 AND 15 THEN 'poco_comun'::"TreeRarity"
  ELSE 'comun'::"TreeRarity"
END;

-- Fijar NOT NULL y eliminar la columna antigua
ALTER TABLE "templates" ALTER COLUMN "rarity" SET NOT NULL;
ALTER TABLE "templates" DROP COLUMN "probability";
