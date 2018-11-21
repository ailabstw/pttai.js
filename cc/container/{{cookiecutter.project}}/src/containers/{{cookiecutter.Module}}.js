import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames/bind'
import Immutable from 'immutable'
import { getUUID, getRootId, getRoot, getChildId, getChildIds, parseQueryString } from '../utils/utils'
import Empty from '../components/Empty'

import styles from './{{cookiecutter.Module}}.css'

// {{cookiecutter.module}}
import * as do{{cookiecutter.Module}} from '../reducers/{{cookiecutter.Module}}'

class {{cookiecutter.Module}} extends PureComponent {
  componentWillMount() {
    const {location: {search}, actions: {do{{cookiecutter.Module}}}} = this.props
    const query = parseQueryString(search)
    
    let myId = getUUID()
    
    do{{cookiecutter.Module}}.init(myId, query)
  }

  render() {
    const { {{cookiecutter.moduleLCamel}}, actions: {do{{cookiecutter.Module}}}} = this.props

    let myId = getRootId(this.props)
    let me = getRoot(this.props)

    if(!myId) return (<Empty />)
    return (
      <div>
        <div>Hello {{cookiecutter.Module}}: {myId}</div>
      </div>  
    )
  }  
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    do{{cookiecutter.Module}}: bindActionCreators(do{{cookiecutter.Module}}, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)({{cookiecutter.Module}})
