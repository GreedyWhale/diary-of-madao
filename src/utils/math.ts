/*
 * @Description: 数学相关的函数
 * @Author: MADAO
 * @Date: 2024-03-21 14:16:57
 * @LastEditors: MADAO
 * @LastEditTime: 2024-03-28 11:44:59
 */
export const isGreaterOrEqual = (leftNum: number, rightNum: number) =>
  leftNum >= rightNum;

const generateRandomPoint = (radius: number) => ({
  x: (Math.random() - 0.5) * radius,
  y: (Math.random() - 0.5) * radius,
});

type Point = Record<"x" | "y", number>;

const isInsideArea = (point: Point, area: Record<"max" | "min", Point>) =>
  point.x >= area.min.x &&
  point.x <= area.max.x &&
  point.y >= area.min.y &&
  point.y <= area.max.y;

const isDistanceGreaterOrEqual = (
  point1: Point,
  point2: Point,
  distance: number,
) => Math.hypot(point1.x - point2.x, point1.y - point2.y) >= distance;

export function generatePoints(
  pointNumber: number,
  excludedArea: Record<"max" | "min", Point>,
  radius: number,
  minDistance: number,
) {
  const points: Point[] = [];

  while (points.length < pointNumber) {
    const newPoint = generateRandomPoint(radius);

    if (
      !isInsideArea(newPoint, excludedArea) &&
      points.every((point) =>
        isDistanceGreaterOrEqual(point, newPoint, minDistance),
      )
    ) {
      points.push(newPoint);
    }
  }

  return points;
}
