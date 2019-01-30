import React, { PureComponent }   from 'react'
import { FormattedMessage }       from 'react-intl'
import { PulseLoader }            from 'react-spinners'
//import $                          from 'jquery'

import styles           from './ArticleComponent.css'
import * as constants   from '../constants/Constants'
import { array2Html }   from '../utils/utils'

import '../../node_modules/quill/dist/quill.bubble.css'

class ArticleComponent extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      noResult: false,
    };
    //this.handleLongPress          = this.handleLongPress.bind(this)
    //this.handleLongPressRelease   = this.handleLongPressRelease.bind(this)
  }

  componentWillReceiveProps(nextProp) {
    const { pullCount } = this.props

    if ( pullCount === constants.ARTICLE_PULL_COUNT_DOWN && nextProp.pullCount === 0) {
      this.setState({noResult: true})
    }
  }

  componentDidMount() {
    // For mobile
    //$("#article-main-content").on("touchstart", this.handleLongPress);
    //$("#article-main-content").on("touchend", this.handleLongPressRelease);
  }

  componentWillUnmount(){
    // For mobile
    //$("#article-main-content").off("touchstart", this.handleLongPress);
    //$("#article-main-content").off("touchend", this.handleLongPressRelease);
  }

  // handleLongPress () {
  //   const { editArticleAction, articleInfo, userId } = this.props
  //   if (articleInfo.CreatorID === userId) {
  //     this.longPressTimer = setTimeout(() => editArticleAction(), constants.PRESS_TO_EDIT_DELAY);
  //   }
  // }

  // handleLongPressRelease () {
  //   clearTimeout(this.longPressTimer);
  // }

  render() {
    const { articleContentsList, pullCount, editArticleAction, articleInfo, userId, boardInfo, onOpenFriendProfileModal } = this.props
    const { noResult } = this.state

    let htmlContent = array2Html(articleContentsList.reduce((final, piece) => {
      return final.concat(piece.contentBlockArray)
    }, []), boardInfo.ID)

    const loading = (htmlContent === '') && !noResult;
    const cntDown = constants.ARTICLE_PULL_COUNT_DOWN - pullCount;

    return (
      <div id="article-main-content" className={styles['root']}>
      {
        loading? (
          <div className={styles['loading']}>
            <FormattedMessage
              id="article-component.message1"
              defaultMessage="Allow me to fetch the content ... ({cntDown})"
              values={{cntDown: cntDown}}
            />
            <PulseLoader color={'#aaa'} size={6}/>
          </div>
        ): (
          <div className={styles['main-content']}
               //onMouseDown={this.handleLongPress}
               //onMouseUp={this.handleLongPressRelease}
               >
            <div className={styles['author']}>
              <img src={articleInfo.CreatorImg || constants.DEFAULT_USER_IMAGE} alt={'Author Profile'} onClick={() => onOpenFriendProfileModal({
              FriendID: articleInfo.CreatorID,
              Name:     articleInfo.CreatorName || constants.DEFAULT_USER_NAME,
              Img:      articleInfo.CreatorImg  || constants.DEFAULT_USER_IMAGE
            })}/>
              <div title={articleInfo.CreatorName} onClick={() => onOpenFriendProfileModal({
              FriendID: articleInfo.CreatorID,
              Name:     articleInfo.CreatorName || constants.DEFAULT_USER_NAME,
              Img:      articleInfo.CreatorImg  || constants.DEFAULT_USER_IMAGE
            })}> {articleInfo.CreatorName} </div>
              {
                articleInfo.CreatorID === userId ? (
                  <div className={styles['edit-button']} onClick={editArticleAction}></div>
                ):null
              }
            </div>
            <div id='quill-id' className={styles['content']}>
              {
                (noResult) ? (
                  <FormattedMessage
                    id="article-component.message2"
                    defaultMessage="(No content)"
                  />
                ):(
                  <div className={constants.PTT_EDITOR_CLASS_NAME} dangerouslySetInnerHTML={{__html: htmlContent}} />
                )
              }
            </div>
          </div>
        )
      }
      </div>
    )
  }
}

export default ArticleComponent
