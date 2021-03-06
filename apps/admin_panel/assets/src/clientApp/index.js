import React, { Component } from 'react'
import { hot } from 'react-hot-loader/root'
import 'reset-css'
import { ThemeProvider } from 'styled-components'
import theme from '../adminPanelApp/theme'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import ResetPasswordForm from './omg-client-reset-password'
import '../adminPanelApp/globalStyle.css'
class App extends Component {
  componentDidCatch () {
    return 'Something very bad happened, please contact admin.'
  }
  render () {
    return (
      <ThemeProvider theme={theme}>
        <Router basename='/client'>
          <Switch>
            <Route path='/reset_password' exact component={ResetPasswordForm} />
          </Switch>
        </Router>
      </ThemeProvider>
    )
  }
}

export default hot(App)
