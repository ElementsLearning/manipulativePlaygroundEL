import { DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { GeoboardState, useAppDispatch } from "../redux/hooks"
import { PolygonType } from "../types"
import { addPolygon } from "../redux/slices/GeoboardSlice"

export const useGeoboardDragAndDrop = () => {

  const { N } = GeoboardState()
  const dispatch = useAppDispatch()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !active.data.current || !over.data.current) return;
    
    const {x, y} = over.data.current
    const {color, source} = active.data.current

    if (source === 'tray') {
    const polygon: PolygonType = {
        color,
        points: [
          {x, y},
          {x: x === 0 ? 1 : x-1, y: y}
        ]
      }

      dispatch(addPolygon({polygon}))
    }
  }

  return { sensors, handleDragEnd }
}