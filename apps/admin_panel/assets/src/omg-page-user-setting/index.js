import React, { Component } from 'react'
import TopNavigation from '../omg-page-layout/TopNavigation'
import styled from 'styled-components'
import { Input, Button } from '../omg-uikit'
import ImageUploaderAvatar from '../omg-uploader/ImageUploaderAvatar'
import { currentUserProviderHoc } from '../omg-user-current/currentUserProvider'
import { withRouter } from 'react-router-dom'
import { updateCurrentUser } from '../omg-user-current/action'
import { updatePassword } from '../omg-session/action'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import PropTypes from 'prop-types'
const UserSettingContainer = styled.div`
  padding-bottom: 50px;
`
const StyledInput = styled(Input)`
  margin-bottom: 30px;
`
const StyledEmailInput = styled(StyledInput)`
  pointer-events: none;
  margin-top: 30px;
  input {
    border-bottom: none;
  }
`
const StyledRoleInput = styled(StyledInput)`
  margin-bottom: 8px;
  pointer-events: none;
  input {
    border-bottom: none;
  }
`
const Avatar = styled(ImageUploaderAvatar)`
  margin: 0;
  display: inline-block;
`
const InputsContainer = styled.div`
  display: inline-block;
  max-width: 350px;
  width: 100%;
  vertical-align: top;
`
const AvatarContainer = styled.div`
  display: inline-block;
  vertical-align: top;
  margin-right: 50px;
`
const ChangePasswordContainer = styled.div`
  margin-bottom: 30px;
  > div {
    color: ${props => props.theme.colors.B100};
  }
  a {
    color: ${props => props.theme.colors.BL400};
  }
`
const ChangePasswordFormCointainer = styled.div`
  margin-top: 20px;
`

const enhance = compose(
  currentUserProviderHoc,
  connect(
    null,
    { updateCurrentUser, updatePassword }
  ),
  withRouter
)

class UserSettingPage extends Component {
  static propTypes = {
    updatePassword: PropTypes.func.isRequired,
    updateCurrentUser: PropTypes.func.isRequired,
    loadingStatus: PropTypes.string,
    currentUser: PropTypes.object,
    divider: PropTypes.bool
  }
  state = {
    email: '',
    globalRole: '',
    submitStatus: 'DEFAULT',
    changingPassword: false
  }

  componentDidMount () {
    this.setInitialCurrentUserState(this.props)
  }
  UNSAFE_componentWillReceiveProps = props => {
    this.setInitialCurrentUserState(props)
  }
  setInitialCurrentUserState = props => {
    if (props.loadingStatus === 'SUCCESS' && !this.state.currentUserLoaded) {
      this.setState({
        email: props.currentUser.email,
        globalRole: props.currentUser.global_role,
        avatarPlaceholder: props.currentUser.avatar.original,
        currentUserLoaded: true
      })
    }
  }
  onChangeImage = ({ file }) => {
    this.setState({ image: file })
  }
  onChangeEmail = e => {
    this.setState({ email: e.target.value.trim() })
  }
  onChangeOldPassword = e => {
    this.setState({ oldPassword: e.target.value })
  }
  onChangeNewPassword = e => {
    this.setState({ newPassword: e.target.value })
  }
  onChangeNewPasswordConfirmation = e => {
    this.setState({ newPasswordConfirmation: e.target.value })
  }
  onClickUpdateAccount = async e => {
    e.preventDefault()
    try {
      if (this.state.email !== this.props.currentUser.email || this.state.image) {
        this.setState({ submitStatus: 'SUBMITTING' })
        const result = await this.props.updateCurrentUser({
          email: this.state.email,
          avatar: this.state.image
        })
        if (result.data) {
          this.setState({ image: null, submitStatus: 'SUBMITTED' })
        }
      }
      if (
        this.state.changingPassword &&
        this.state.newPassword === this.state.newPasswordConfirmation &&
        this.state.newPassword &&
        this.state.newPasswordConfirmation
      ) {
        this.setState({ submitStatus: 'SUBMITTING' })
        const updatePassworldResult = await this.props.updatePassword({
          oldPassword: this.state.oldPassword,
          password: this.state.newPassword,
          passwordConfirmation: this.state.newPasswordConfirmation
        })
        if (updatePassworldResult.data) {
          this.setState({
            submitStatus: 'SUBMITTED',
            image: null,
            changingPassword: false,
            newPassword: '',
            newPasswordConfirmation: ''
          })
        } else {
          this.setState({ submitStatus: 'FAILED' })
        }
      }
    } catch (error) {
      this.setState({ submitStatus: 'FAILED' })
    }
  }
  onClickChangePassword = e => {
    this.setState({ changingPassword: true })
  }
  render () {
    return (
      <UserSettingContainer>
        <TopNavigation
          divider={this.props.divider}
          title={'My Profile'}
          secondaryAction={false}
        />
        {this.props.loadingStatus === 'SUCCESS' && (
          <form onSubmit={this.onClickUpdateAccount} noValidate>
            <AvatarContainer>
              <Avatar
                onChangeImage={this.onChangeImage}
                size='180px'
                placeholder={this.state.avatarPlaceholder}
              />
            </AvatarContainer>
            <InputsContainer>
              <StyledEmailInput
                placeholder={'Email'}
                value={this.state.email}
                prefill
                onChange={this.onChangeEmail}
              />
              <StyledRoleInput
                placeholder={'Global Role'}
                value={_.startCase(this.state.globalRole)}
                prefill
              />
              <ChangePasswordContainer>
                <div>Password</div>
                {this.state.changingPassword ? (
                  <ChangePasswordFormCointainer>
                    <StyledInput
                      normalPlaceholder={'Old Password'}
                      value={this.state.oldPassword}
                      onChange={this.onChangeOldPassword}
                      type='password'
                    />
                    <StyledInput
                      normalPlaceholder={'New Password'}
                      value={this.state.newPassword}
                      onChange={this.onChangeNewPassword}
                      type='password'
                    />
                    <StyledInput
                      normalPlaceholder={'New Password Confirmation'}
                      value={this.state.newPasswordConfirmation}
                      onChange={this.onChangeNewPasswordConfirmation}
                      type='password'
                    />
                  </ChangePasswordFormCointainer>
                ) : (
                  <a onClick={this.onClickChangePassword}>Change password</a>
                )}
              </ChangePasswordContainer>
              <Button
                size='small'
                type='submit'
                key={'save'}
                disabled={
                  !this.state.image &&
                  this.state.email === this.props.currentUser.email &&
                  (this.state.newPassword !== this.state.newPasswordConfirmation ||
                    !this.state.newPassword ||
                    !this.state.newPasswordConfirmation)
                }
                loading={this.state.submitStatus === 'SUBMITTING'}
              >
                Save Changes
              </Button>
            </InputsContainer>
          </form>
        )}
      </UserSettingContainer>
    )
  }
}
export default enhance(UserSettingPage)
