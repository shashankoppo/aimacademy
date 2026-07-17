import { Request, Response } from "express";
import { prisma } from "../prisma";

const handleError = (res: Response, error: unknown, fallbackMessage: string) => {
  console.error(fallbackMessage, error);
  const message = error instanceof Error ? error.message : fallbackMessage;
  if (!res.headersSent) res.status(500).json({ success: false, message });
};

// --- PUBLIC ENDPOINTS ---

export const createLead = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, course, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone are required" });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        course,
        message,
        status: "NEW",
      },
    });

    res.status(201).json({ success: true, lead });
  } catch (error) {
    handleError(res, error, "Failed to submit inquiry");
  }
};

// --- ADMIN ENDPOINTS ---

export const getLeads = async (_req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, leads });
  } catch (error) {
    handleError(res, error, "Failed to get leads");
  }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, lead });
  } catch (error) {
    handleError(res, error, "Failed to update lead status");
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Failed to delete lead");
  }
};
