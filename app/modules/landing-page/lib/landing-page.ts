import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { and, countDistinct, desc, eq, inArray, sql } from "drizzle-orm";
import * as schema from "~/db/schema";
import {
  categories,
  CourseStatus,
  courses,
  lessons,
  modules,
  users,
} from "~/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export const FEATURED_COURSE_LIMIT = 3;

export type FeaturedCourse = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  instructorName: string;
  categoryName: string;
  lessonCount: number;
};

export type CatalogueStats = {
  courses: number;
  lessons: number;
  instructors: number;
};

export type LandingPage = {
  featuredCourses: FeaturedCourse[];
  stats: CatalogueStats;
};

const isPublished = eq(courses.status, CourseStatus.Published);

function getNewestPublishedCourses(db: Db) {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      coverImageUrl: courses.coverImageUrl,
      instructorName: users.name,
      categoryName: categories.name,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(isPublished)
    .orderBy(desc(courses.createdAt), desc(courses.id))
    .limit(FEATURED_COURSE_LIMIT)
    .all();
}

function getLessonCounts(db: Db, courseIds: number[]) {
  const rows = db
    .select({ courseId: modules.courseId, count: sql<number>`count(*)` })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(inArray(modules.courseId, courseIds))
    .groupBy(modules.courseId)
    .all();
  return new Map(rows.map((row) => [row.courseId, row.count]));
}

function getFeaturedCourses(db: Db): FeaturedCourse[] {
  const newest = getNewestPublishedCourses(db);
  const lessonCounts = getLessonCounts(
    db,
    newest.map((course) => course.id)
  );
  return newest.map((course) => ({
    ...course,
    lessonCount: lessonCounts.get(course.id) ?? 0,
  }));
}

function getCatalogueStats(db: Db): CatalogueStats {
  const [courseRow] = db
    .select({
      courses: countDistinct(courses.id),
      instructors: countDistinct(courses.instructorId),
    })
    .from(courses)
    .where(isPublished)
    .all();
  const [lessonRow] = db
    .select({ lessons: sql<number>`count(*)` })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, and(eq(modules.courseId, courses.id), isPublished))
    .all();
  return {
    courses: courseRow.courses,
    lessons: lessonRow.lessons,
    instructors: courseRow.instructors,
  };
}

export function getLandingPage(db: Db): LandingPage {
  return {
    featuredCourses: getFeaturedCourses(db),
    stats: getCatalogueStats(db),
  };
}
