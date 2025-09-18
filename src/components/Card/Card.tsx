import { useMemo, useState } from 'react'
import './Card.css'
import cardsData from '../../lib/data/cardsList.json'
import { decorateHint } from '../utils/decorateHint'

type SvgInfo = {
  flatId: string
  url: string
  id: string
} | null

type CardItem = {
  id: string
  front: string
  back: string
  hint: string
  svg: SvgInfo
}

const Card = () => {
  const cards: CardItem[] = useMemo(() => {
    const arr = Array.isArray(cardsData.cards) ? cardsData.cards : []
    return arr.map((card) => ({
      id: card.id ?? '',
      front: card.front ?? '',
      back: card.back ?? '',
      hint: card.hint ?? '',
      svg: card.svg ?? null,
    }))
  }, [])

  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)
  const [hideBackText, setHideBackText] = useState<boolean>(false)

  const current: CardItem | undefined = cards[currentIndex]
  if (!current) return null

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((index) => (index + 1) % cards.length)
    setHideBackText(true)
    setTimeout(() => {
      setHideBackText(false)
    }, 500)
  }

  const handleActivate = () => {
    if (!isFlipped) {
      setIsFlipped(true)
    } else {
      handleNext()
    }
  }

  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleActivate()
        }
      }}
      aria-pressed={isFlipped}
    >
      <div className={"card-inner" + (isFlipped ? " is-flipped" : "")}>
        <div className="card-face card-front">
          {current.svg?.url ? (
            <img className="card-image" src={current.svg.url} alt={current.front} />
          ) : (
            <div className="card-image placeholder" aria-hidden="true" />
          )}
          <div className="card-word">{current.front}</div>
          {current.hint ? <div className="card-hint">{decorateHint(current.front, current.hint)}</div> : null}
        </div>
        <div className="card-face card-back">
          <div className="card-back-word">{ hideBackText ? " " : current.back}</div>
        </div>
      </div>
    </div>
  )
}

export default Card