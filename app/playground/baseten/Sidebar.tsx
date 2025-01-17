import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BaseTenState, useAppDispatch } from "@/lib/redux/hooks"
import { clearBoard, clearSelected, deleteSelected, groupSelected, nextQuestion, randomizeBoard, setMode, splitSelected, switchRole, toggleDisplay, toggleGrouping, toggleSorting } from "@/lib/redux/slices/BaseTenSlice"
import { getNum, getType, getWholeSum } from "@/lib/utils"
import { useEffect, useState } from "react"

type SidebarProps = {
}

const modes = [
  "sandbox",
  "trivia",
  "basic maths",
  "advanced maths",
]

export const Sidebar: React.FC<SidebarProps> = () => {

  const { display, blocks, sorting, grouping, mode, role, question, operator, supply } = BaseTenState()
  const dispatch = useAppDispatch()

  const [triviaAnswer, setTriviaAnswer] = useState(0)

  const selectedBlocks = blocks.filter(b => b.selected)
  const sumOne = getWholeSum(blocks.filter(b => b.source === 'operandOne'))
  const sumTwo = getWholeSum(blocks.filter(b => b.source === 'operandTwo'))

  const [width, setWidth] = useState(-1)
  const [height, setHeight] = useState(-1)

  useEffect(() => {
    const handleSizeChange = () => {
      setWidth(window.innerWidth)
      setHeight(window.innerHeight)
    }

    handleSizeChange()
    window.addEventListener('resize', handleSizeChange)
    return () => window.removeEventListener('resize', handleSizeChange)
  }, [window.innerWidth, window.innerHeight])

  const correctAnswer = (
    mode === 'trivia' ? (
      role === 'board' ? 
      getWholeSum(blocks) === question as number :
      triviaAnswer === getWholeSum(blocks)
    ) :
    mode === 'basic maths' && question instanceof Array ? (
      operator === '+' ? 
      sumOne + sumTwo === question[0] + question[1] : 
      sumOne - sumTwo === question[0] - question[1]
    ) : 
    mode === 'advanced maths' && question instanceof Array ? (
      operator === '*' ?
      getWholeSum(blocks) === question[0] :
      getWholeSum(supply) === question[0] % question[1]
    ) : false
  )

  return (
    <ScrollArea className={`hidden md:flex h-[calc(100vh-16px)] lg:h-[calc(100vh-32px)] xl:h-[calc(100vh-64px)] w-48 lg:w-64 xl:w-72`}>
      <div className="flex flex-col gap-1 lg:gap-2 xl:gap-3 justify-between h-full">
        
        <div className="bg-neutral-800 rounded-lg flex flex-col gap-1 lg:gap-2 p-2 xl:p-4">
          <h1 className='text-2xl xl:text-3xl font-bold font-mono text-white text-center'>{`${width}x${height}`}</h1>

          {(mode === 'sandbox') && <h4 className={`text-4xl lg:text-5xl xl:text-7xl font-bold font-mono text-white text-center ${!display && "text-neutral-700"}`}>{!display ? "???" : getWholeSum(blocks)}</h4>}
          {(mode !== 'sandbox' && role === 'board') && 
          <>
          {question instanceof Array && role === 'board' ? 
          <div className="flex gap-1 items-center justify-center text-4xl lg:text-5xl font-mono">
            <p className={`${sumOne === question[0] || (mode === 'advanced maths' && correctAnswer) ? "text-green-500" : "text-red-500"}`}>{question[0]}</p>
            <p className={`${correctAnswer ? "text-green-500" : "text-red-500"}`}>{operator}</p>
            <p className={`${sumTwo === question[1] || mode === 'advanced maths' ? "text-green-500" : "text-red-500"}`}>{question[1]}</p>
          </div> :
          <h4 className={`text-center text-4xl lg:text-5xl font-mono ${correctAnswer ? "text-green-500" : "text-red-500"}`}>{question as number}</h4>}
          </>}
          {(mode !== 'sandbox' && role === 'text') && <Input autoFocus type="number" value={triviaAnswer} onChange={e => setTriviaAnswer(parseInt(e.target.value))} className={`text-center h-fit p-1 text-3xl lg:text-4xl xl:text-6xl font-mono ${correctAnswer ? "text-green-500" : "text-red-500"}`} />}
            <Button className="text-xs lg:text-[14px] h-8 lg:h-10" onClick={() => {dispatch(clearBoard()); setTriviaAnswer(0)}}>Clear</Button>
            {mode === 'sandbox' ? <Button className="text-xs lg:text-[14px] h-8 lg:h-10" onClick={() => dispatch(randomizeBoard())}>Randomize</Button>:
            <>
              <Button className="flex-1 text-xs lg:text-[14px] h-8 lg:h-10" onClick={() => dispatch(switchRole())}>Switch</Button>
              <Button className="flex-1 text-xs lg:text-[14px] h-8 lg:h-10" onClick={() => {dispatch(nextQuestion()); setTriviaAnswer(0)}}>Next Question</Button>
            </>}
        </div>

        <div className="bg-neutral-900 rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-2 xl:p-4 p-2">
          <Button className="text-xs lg:text-[14px] h-8 lg:h-10" disabled={selectedBlocks.length === 0 || selectedBlocks.every(b => b.type === "ONES")} onClick={() => dispatch(splitSelected())}>{`Split Selected`}</Button>
          <Button className="text-xs lg:text-[14px] h-8 lg:h-10" disabled={selectedBlocks.length !== 10 || selectedBlocks.some(b => b.type !== selectedBlocks[0].type || b.source !== selectedBlocks[0].source)} 
          onClick={() => dispatch((groupSelected({source: selectedBlocks[0].source, type: getType(getNum(selectedBlocks[0].type)*10)})))}>{`Group Selected`}</Button>
          <Button className="text-xs lg:text-[14px] h-8 lg:h-10" disabled={selectedBlocks.length === 0} onClick={() => dispatch(clearSelected())}>{`Unselect All`}</Button>
          <Button className="text-xs lg:text-[14px] h-8 lg:h-10" disabled={role === 'text' || selectedBlocks.length === 0} onClick={() => dispatch(deleteSelected())}>{`Delete Selected`}</Button>
        </div>

        <div className="bg-neutral-900 rounded-lg flex flex-col gap-1 lg:gap-2 p-2 xl:p-4">
          {mode === 'sandbox' && <Button className="text-xs lg:text-[14px] h-8 lg:h-10" variant={"secondary"} onClick={() => dispatch(toggleDisplay())}>{`${!display ? "Show" : "Hide"} Sum`}</Button>}
          <Button className="text-xs lg:text-[14px] h-8 lg:h-10" variant={"secondary"} onClick={() => dispatch(toggleSorting())}>{`${sorting ? "Disable" : "Enable"} Sorting`}</Button>
          <Button className="text-xs lg:text-[14px] h-8 lg:h-10" variant={"secondary"} onClick={() => dispatch(toggleGrouping())}>{`${grouping ? "Disable" : "Enable"} Grouping`}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-2">
          {modes.map(m => 
            <Button className="capitalize text-xs lg:text-[14px] h-8 lg:h-10" key={m} variant={m === mode ? "default" : "outline"} onClick={() => dispatch(setMode({mode: m}))}>{m}</Button>
          )}
        </div>

      </div>
    </ScrollArea>
  )
}
