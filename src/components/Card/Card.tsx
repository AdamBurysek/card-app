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

  const currentCard: CardItem | undefined = cards[currentIndex]
  if (!currentCard) return null

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((index) => (index + 1) % cards.length)
    setHideBackText(true)
    setTimeout(() => {
      setHideBackText(false)
    }, 500)
  }

  const handleCardFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true)
    } else {
      handleNext()
    }
  }

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardFlip()
    }
  }

  return (
    <div
      className="card"
      role="button"
      tabIndex={0}
      onClick={handleCardFlip}
      onKeyDown={handleCardKeyDown}
      aria-pressed={isFlipped}
    >
      <div className={"card-inner" + (isFlipped ? " is-flipped" : "")}>
        <div className="card-face card-front">
          {currentCard.svg?.url ? (
            <img className="card-image" src={currentCard.svg.url} alt={currentCard.front} />
          ) : (
            <div className="card-image placeholder" aria-hidden="true" />
          )}
          <div className="card-word">{currentCard.front}</div>
          {currentCard.hint ? <div className="card-hint">{decorateHint(currentCard.front, currentCard.hint)}</div> : null}
        </div>
        <div className="card-face card-back">
          <div className="card-back-word">{ hideBackText ? " " : currentCard.back}</div>
        </div>
      </div>
    </div>
  )
}

export default Card