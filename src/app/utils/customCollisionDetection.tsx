import { Collision, rectIntersection } from "@dnd-kit/core";

export default function customCollisionDetection(
  args: Parameters<typeof rectIntersection>[0]
): Collision[] {
  const collisions = rectIntersection(args);

  // If the dragged item is still intersecting its own droppable, return only that collision.
  const selfCollision = collisions.find(
    (collision) => collision.id === args.active.id
  );
  if (selfCollision) {
    return [selfCollision];
  }

  return collisions;
}
