"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// === BOOKS ===
export async function getBooks() {
  return await prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createBook(data) {
  const book = await prisma.book.create({ data });
  revalidatePath("/books");
  revalidatePath("/admin/books");
  return book;
}

export async function deleteBook(id) {
  await prisma.book.delete({ where: { id } });
  revalidatePath("/books");
  revalidatePath("/admin/books");
}

export async function updateBook(id, data) {
  const book = await prisma.book.update({ where: { id: Number(id) }, data });
  revalidatePath("/books");
  revalidatePath("/admin/books");
  return book;
}

// === GAMES ===
export async function getGames() {
  return await prisma.game.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getGame(id) {
  return await prisma.game.findUnique({ where: { id: Number(id) } });
}

export async function createGame(data) {
  await prisma.game.create({ data });
  revalidatePath("/games");
  revalidatePath("/admin/games");
}

export async function deleteGame(id) {
  await prisma.game.delete({ where: { id } });
  revalidatePath("/games");
  revalidatePath("/admin/games");
}

export async function updateGame(id, data) {
  const game = await prisma.game.update({ where: { id: Number(id) }, data });
  revalidatePath("/games");
  revalidatePath("/admin/games");
  return game;
}

// === VIDEOS ===
export async function getVideos() {
  return await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function createVideo(data) {
  const video = await prisma.video.create({ data });
  revalidatePath("/tv");
  revalidatePath("/admin/tv");
  return video;
}

export async function deleteVideo(id) {
  await prisma.video.delete({ where: { id } });
  revalidatePath("/tv");
  revalidatePath("/admin/tv");
}

export async function updateVideo(id, data) {
  const video = await prisma.video.update({ where: { id: Number(id) }, data });
  revalidatePath("/tv");
  revalidatePath("/admin/tv");
  return video;
}
