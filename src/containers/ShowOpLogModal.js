import React, { PureComponent } from 'react'
import { connect }              from 'react-redux'
import { bindActionCreators }   from 'redux'
import Modal                    from 'react-modal'
import Immutable                from 'immutable'

import * as doShowOpLogModal    from '../reducers/ShowOpLogModal'

import * as constants           from '../constants/Constants'
import * as modalConstants      from '../constants/ModalConstants'
import DropdownComponent        from '../components/DropdownComponent'

import styles from './ShowOpLogModal.css'

class ShowOpLogModal extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      tab: props.modalInput.tabs[0],
      opLog: {},
    };
  }

  componentWillMount() {
    const { actions: { doShowOpLogModal }, modalInput: { tabs, params }, myId } = this.props
    doShowOpLogModal.getOpLogs(myId, tabs, params)
  }

  render() {
    const { myId,
            showOpLogModal,
            onModalClose,
            modal: { currentModal },
            modalInput: { tabs }} = this.props

    const { tab } = this.state

    // const pttMasterStatus       = (tab === constants.SHOW_PTT_MASTER_TAB)?      '-active':''
    // const pttMeStatus           = (tab === constants.SHOW_PTT_ME_TAB)?          '-active':''
    // const contentBoardStatus    = (tab === constants.SHOW_CONTENT_BOARD_TAB)?   '-active':''
    // const contentCommentStatus  = (tab === constants.SHOW_CONTENT_COMMENT_TAB)? '-active':''
    // const contentMasterStatus   = (tab === constants.SHOW_CONTENT_MASTER_TAB)?  '-active':''
    // const contentMemberStatus   = (tab === constants.SHOW_CONTENT_MEMBER_TAB)?  '-active':''
    // const friendFriendStatus    = (tab === constants.SHOW_FRIEND_FRIEND_TAB)?   '-active':''

    let me      = showOpLogModal.get(myId, Immutable.Map())
    let opLogs  = me.get('opLogs', Immutable.Map()).toJS()
    let opLog   = opLogs[tab]? opLogs[tab]: []
    let that    = this

    let dropdownList = tabs.map((item, index) => {
      let title   = null
      let fTitle  = null
      switch(item) {
          case constants.SHOW_PTT_MASTER_TAB:
            title   = 'ptt master'
            fTitle  = 'Ptt Master Op-Log'
            break;
          case constants.SHOW_PTT_ME_TAB:
            title   = 'ptt me'
            fTitle  = 'Ptt Me Op-Log'
            break;
          case constants.SHOW_CONTENT_BOARD_TAB:
            title   = 'board'
            fTitle  = 'Content Board Op-Log'
            break;
          case constants.SHOW_CONTENT_COMMENT_TAB:
            title   = 'comment'
            fTitle  = 'Content Comment Op-Log'
            break;
          case constants.SHOW_CONTENT_MASTER_TAB:
            title   = 'master'
            fTitle  = 'Content Master Op-Log'
            break;
          case constants.SHOW_CONTENT_MEMBER_TAB:
            title   = 'member'
            fTitle  = 'Content Member Op-Log'
            break;
          case constants.SHOW_FRIEND_FRIEND_TAB:
            title   = 'friend'
            fTitle  = 'Friend Op-Log'
            break;
          case constants.SHOW_PTT_PEERS_TAB:
            title   = 'ptt peers'
            fTitle  = 'Ptt Peers'
            break;
          default:
            break;
      }
      return {
          id: item,
          title: title,
          fullTitle: fTitle,
          selected: false,
          action: () => that.setState({tab:item}),
      }
    })

    return (
      <div>
        <Modal
          overlayClassName="ShowOpLogModal__Overlay"
          style={modalConstants.ShowOpLogModalStyels}
          isOpen={currentModal !== null}
          onRequestClose={null}
          contentLabel="Show Op Log Modal">
          <div className={styles['root']}>
            <div className={styles['top-bar']}>
              <div className={styles['prev-button']}>
                <div className={styles['prev-button-icon']} onClick={onModalClose}></div>
              </div>
              <div className={styles['title']}>
                OP Logs
              </div>
              <div className={styles['multi-device']}>
                <span >
                  <DropdownComponent title={ dropdownList.find( i => i.id === tab ).title }
                                     list={ dropdownList }/>
                </span>
              </div>
            </div>
            <div className={styles['content']}>
              <div className={styles['content-title']}>{dropdownList.find( i => i.id === tab ).fullTitle}</div>
              <div className={styles['oplog-list']}>
              {
                tab === constants.SHOW_PTT_PEERS_TAB ? opLog.map((item, index) => {
                  return (
                    <div className={styles['oplog-item']} key={index}>
                      <div className={styles['item-index']}>
                        <div className={styles['op-value-index']}>Neighbor {index}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Node ID</div>
                        <div className={styles['op-value']}>{item.ID}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Peer Type</div>
                        <div title={item.T} className={styles['op-value']}>{constants.PEER_TYPE_ARRAY[item.T]}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>User ID</div>
                        <div className={styles['op-value']}>{item.UID}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>IP</div>
                        <div className={styles['op-value']}>{item.Addr.IP}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Port</div>
                        <div className={styles['op-value']}>{item.Addr.Port}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Zone</div>
                        <div className={styles['op-value']}>{item.Addr.Zone}</div>
                      </div>
                    </div>
                  )
                }) : opLog.map((item, index) => {
                  return (
                    <div className={styles['oplog-item']} key={index}>
                      <div className={styles['item-index']}>
                        <div className={styles['op-value-index']}>Index {index}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Version</div>
                        <div className={styles['op-value']}>{item.V}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>ID</div>
                        <div className={styles['op-value']}>{item.ID}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Creator ID</div>
                        <div className={styles['op-value']}>{item.CID}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Create TS</div>
                        <div className={styles['op-value']}>{JSON.stringify(item.CT)}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Obj ID</div>
                        <div className={styles['op-value']}>{item.OID}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Op</div>
                        <div title={item.O} className={styles['op-value']}>{constants.OP_TYPE_ARRAY[item.O]}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Data</div>
                        <div className={styles['op-value']}>{JSON.stringify(item.D)}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Update TS</div>
                        <div className={styles['op-value']}>{JSON.stringify(item.UT)}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Master Log ID</div>
                        <div className={styles['op-value']}>{item.mID}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Master Signs</div>
                        <div className={styles['op-value']}>{JSON.stringify(item.m)}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Internal Signs</div>
                        <div className={styles['op-value']}>{JSON.stringify(item.i)}</div>
                      </div>
                      <div className={styles['item']}>
                        <div className={styles['op-title']}>Is Sync</div>
                        <div className={styles['op-value']}>{item.y}</div>
                      </div>
                    </div>
                  )
                })
              }
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...state,
})

const mapDispatchToProps = (dispatch) => ({
  actions: {
    doShowOpLogModal: bindActionCreators(doShowOpLogModal, dispatch),
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(ShowOpLogModal)
