import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/*
 * Candidate endpoints tried in order until one returns a non-empty list.
 * Covers: /api/courses, /courses, /api/v1/courses
 */
const ENDPOINTS = ['/api/courses', '/courses', '/api/v1/courses'];

/*
 * Normalize whatever the backend sends into a clean string[].
 *
 * Supported API shapes:
 *   [{"CourseID":10,"CourseName":"SQL Basics",...}]   ← SQL Server / MSSQL style (PascalCase)
 *   [{"id":10,"name":"SQL Basics"}]                   ← camelCase REST
 *   [{"course_id":10,"course_name":"SQL Basics"}]     ← snake_case
 *   ["SQL Basics", ...]                               ← plain string array
 *   {"data":[...]} / {"courses":[...]}                ← wrapped envelope
 */
function normalizeData(data) {
  let raw = data;

  /* Unwrap common envelope shapes */
  if (raw && !Array.isArray(raw)) {
    raw = raw.data ?? raw.courses ?? raw.result ?? raw.rows ?? raw.items ?? [];
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((c) => {
      if (typeof c === 'string') return c.trim();
      if (c && typeof c === 'object') {
        /* Priority: SQL Server PascalCase → camelCase → snake_case */
        const name =
          c.CourseName ??    /* SQL Server / MSSQL PascalCase  */
          c.courseName ??    /* camelCase REST                 */
          c.course_name ??   /* snake_case                     */
          c.name ??          /* generic                        */
          c.title ??
          c.label ??
          null;
        return typeof name === 'string' ? name.trim() : null;
      }
      return null;
    })
    .filter((c) => typeof c === 'string' && c.length > 0);
}

export function useCourses() {
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [offline, setOffline]   = useState(false);
  const [endpoint, setEndpoint] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setOffline(false);

    for (const ep of ENDPOINTS) {
      try {
        const res = await api.get(ep);

        /* Always check res.data is present */
        if (!res || !('data' in res)) continue;

        const raw = res.data;

        /* Log in dev so the developer can see exactly what the API returned */
        if (process.env.NODE_ENV === 'development') {
          console.info(`[useCourses] ${ep} →`, raw);
        }

        /* Validate it's an array (or unwrappable object) before normalizing */
        if (!Array.isArray(raw) && (typeof raw !== 'object' || raw === null)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[useCourses] ${ep} returned unexpected type:`, typeof raw);
          }
          continue;
        }

        const list = normalizeData(raw);

        if (list.length > 0) {
          setCourses(list);
          setEndpoint(ep);
          setLoading(false);
          return;
        }
        /* Empty list → try next endpoint */
      } catch (err) {
        if (!err.response) {
          /* Network / CORS error — no point trying more endpoints */
          setOffline(true);
          setLoading(false);
          return;
        }
        /* 404 / 500 → try next endpoint */
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useCourses] ${ep} → HTTP ${err.response.status}`);
        }
      }
    }

    /* All endpoints exhausted with no data */
    setLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return { courses, loading, offline, endpoint, retry: fetchCourses };
}
