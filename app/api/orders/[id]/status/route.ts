import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // 🔹 Używamy Promise, bo Next 15 przekazuje async context
) {
  const params = await context.params; // 🔹 teraz params zawsze będzie dostępne
  const { id } = params;

  try {
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Brak pola 'status' w żądaniu" },
        { status: 400 }
      );
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "Nieprawidłowe ID zamówienia" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: numericId },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("❌ Błąd przy aktualizacji statusu:", error);
    return NextResponse.json(
      { error: "Nie udało się zaktualizować statusu" },
      { status: 500 }
    );
  }
}
