import React, { PureComponent } from 'react'
import styles from './DropdownComponent.module.scss'

class DropdownComponent extends PureComponent {
  constructor (props) {
    super()
    this.state = {
      listOpen: false
    }
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.toggleList = this.toggleList.bind(this)
  }

  handleClickOutside () {
    document.removeEventListener('click', this.handleClickOutside, false)
    this.setState({
      listOpen: false
    })
  }

  toggleList () {
    if (!this.state.listOpen) {
      document.addEventListener('click', this.handleClickOutside, false)
    } else {
      document.removeEventListener('click', this.handleClickOutside, false)
    }

    this.setState(prevState => ({
      listOpen: !prevState.listOpen
    }))
  }

  render () {
    const { title, list } = this.props
    const { listOpen } = this.state

    return (
      <div className={styles['dd-wrapper']}>
        <div className={styles['dd-header']} onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          this.toggleList()
        }}>
          <div className={styles['dd-header-title']}>
            {title}
          </div>
        </div>
        {listOpen && <div className={styles['dd-list']}>
          {list.map((item) => (
            <div className={styles['dd-list-item-wrapper']} key={item.id}>
              <div className={styles['dd-list-item']}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  item.action()
                  this.toggleList()
                }}>
                {item.title}
              </div>
            </div>
          ))}
        </div>}
      </div>
    )
  }
}

export default DropdownComponent
