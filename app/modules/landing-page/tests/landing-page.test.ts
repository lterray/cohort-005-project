import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import * as schema from "~/db/schema";
import { CourseStatus, UserRole } from "~/db/schema";
import { markdown } from "~/lib/text";
import { createLandingPage } from "../index.server";

let db: TestDb;
let instructor: typeof schema.users.$inferSelect;
let categoryId: number;
let baseCourse: typeof schema.courses.$inferSelect;

beforeEach(() => {
  db = createTestDb();
  const base = seedBaseData(db);
  instructor = base.instructor;
  categoryId = base.category.id;
  baseCourse = base.course;
});

// ─── Fixtures ───
// The landing page only reads, so rows go in directly. Kept in one place so
// a schema change touches only this block.

let counter = 0;

function addInstructor(name: string) {
  counter++;
  return db
    .insert(schema.users)
    .values({
      name,
      email: `instructor-${counter}@example.com`,
      role: UserRole.Instructor,
    })
    .returning()
    .get();
}

function addCourse(
  title: string,
  options: {
    status?: CourseStatus;
    createdAt?: string;
    instructorId?: number;
  } = {}
) {
  counter++;
  return db
    .insert(schema.courses)
    .values({
      title,
      slug: `course-${counter}`,
      description: `${title} description`,
      salesCopy: markdown(`## ${title}`),
      instructorId: options.instructorId ?? instructor.id,
      categoryId,
      status: options.status ?? CourseStatus.Published,
      createdAt: options.createdAt,
    })
    .returning()
    .get();
}

function addLessons(courseId: number, perModule: number[]) {
  perModule.forEach((count, position) => {
    const module = db
      .insert(schema.modules)
      .values({ courseId, title: `Module ${position}`, position })
      .returning()
      .get();
    for (let i = 0; i < count; i++) {
      db.insert(schema.lessons)
        .values({ moduleId: module.id, title: `Lesson ${i}`, position: i })
        .run();
    }
  });
}

function landing() {
  return createLandingPage(db).get();
}

// ─── Spotlight and new courses ───

function shownTitles() {
  const { spotlight, newCourses } = landing();
  return {
    spotlight: spotlight?.title ?? null,
    newCourses: newCourses.map((course) => course.title),
  };
}

function shownCourses() {
  const { spotlight, newCourses } = landing();
  return spotlight ? [spotlight, ...newCourses] : newCourses;
}

describe("spotlight and new courses", () => {
  it("spotlights the newest published course and lists the next three", () => {
    addCourse("Oldest", { createdAt: "2098-01-01T00:00:00.000Z" });
    addCourse("Newest", { createdAt: "2098-04-01T00:00:00.000Z" });
    addCourse("Middle", { createdAt: "2098-03-01T00:00:00.000Z" });
    addCourse("Second", { createdAt: "2098-03-15T00:00:00.000Z" });

    expect(shownTitles()).toEqual({
      spotlight: "Newest",
      newCourses: ["Second", "Middle", "Oldest"],
    });
  });

  it("shows no course twice and at most four in all", () => {
    for (let i = 0; i < 5; i++) {
      addCourse(`Extra ${i}`, { createdAt: `209${i}-01-01T00:00:00.000Z` });
    }

    const ids = shownCourses().map((course) => course.id);

    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });

  it("leaves out drafts and archived courses", () => {
    addCourse("Draft", {
      status: CourseStatus.Draft,
      createdAt: "2099-01-01T00:00:00.000Z",
    });
    addCourse("Archived", {
      status: CourseStatus.Archived,
      createdAt: "2099-01-01T00:00:00.000Z",
    });

    expect(shownTitles()).toEqual({
      spotlight: "Test Course",
      newCourses: [],
    });
  });

  it("carries the instructor, category and cover of each course", () => {
    const course = landing().spotlight;

    expect(course).toEqual({
      id: baseCourse.id,
      title: "Test Course",
      slug: "test-course",
      description: "A test course",
      coverImageUrl: null,
      instructorName: "Test Instructor",
      categoryName: "Programming",
      lessonCount: 0,
    });
  });

  it("counts lessons across every module of each course", () => {
    addLessons(baseCourse.id, [2, 3]);
    const other = addCourse("Other", {
      createdAt: "2000-01-01T00:00:00.000Z",
    });
    addLessons(other.id, [4]);

    const counts = Object.fromEntries(
      shownCourses().map((c) => [c.title, c.lessonCount])
    );

    expect(counts).toEqual({ "Test Course": 5, Other: 4 });
  });

  it("is empty when nothing is published", () => {
    const empty = createTestDb();

    expect(createLandingPage(empty).get()).toEqual({
      spotlight: null,
      newCourses: [],
      stats: { courses: 0, lessons: 0, instructors: 0 },
    });
  });
});

// ─── Catalogue stats ───

describe("catalogue stats", () => {
  it("counts every published course, not only the featured ones", () => {
    for (let i = 0; i < 4; i++) addCourse(`Extra ${i}`);

    expect(landing().stats.courses).toBe(5);
  });

  it("counts lessons only in published courses", () => {
    addLessons(baseCourse.id, [2, 1]);
    const draft = addCourse("Draft", { status: CourseStatus.Draft });
    addLessons(draft.id, [7]);

    expect(landing().stats.lessons).toBe(3);
  });

  it("counts each instructor of a published course once", () => {
    const other = addInstructor("Olive Other");
    addCourse("Second by base instructor");
    addCourse("By other", { instructorId: other.id });
    const drafter = addInstructor("Dora Drafter");
    addCourse("Draft", {
      status: CourseStatus.Draft,
      instructorId: drafter.id,
    });

    expect(landing().stats).toEqual({
      courses: 3,
      lessons: 0,
      instructors: 2,
    });
  });
});
