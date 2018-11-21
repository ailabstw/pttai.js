import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames/bind'
import Immutable from 'immutable'
import { getUUID, getRootId, getRoot, getChildId, getChildIds } from '../utils/utils'
import Empty from '../components/Empty'

import styles from './{{cookiecutter.Module}}.css'

class {{cookiecutter.Module}} extends PureComponent {
  render() {
    const { myId, {{cookiecutter.moduleLCamel}}, actions: {do{{cookiecutter.Module}}}} = this.props

    if(!myId) return (<Empty />)

    let me = {{cookiecutter.moduleLCamel}}.get(myId, Immutable.Map())
    return (
      <div>
        <div>Hello {{cookiecutter.Module}}: {myId}</div>
      </div>  
    )
  }  
}

export default {{cookiecutter.Module}}
