import React, { PureComponent } from 'react'
import classnames from 'classnames/bind'
import Empty from './Empty'
import styles from './{{cookiecutter.Module}}.css'

class {{cookiecutter.Module}} extends PureComponent {
  render() {
    const {...params} = this.props
    
    return (
      <div>
        Hello {{cookiecutter.Module}}
      </div>  
    )
  }
}

export default {{cookiecutter.Module}}
