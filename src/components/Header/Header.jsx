import React, {Component} from 'react';
import { Link } from 'react-router-dom'
import {Icon} from "../Icon/Icon";
import {SearchInput} from "../SearchInput/SearchInput";
import {HeaderTitle} from "../HeaderTitle/HeaderTitle";
import {HeaderBtn} from "../HeaderBtn/HeaderBtn";
import {Avatar} from "../Avatar/Avatar";
import './Header.css';
import api from '../../api';
import { setSelectedUsers } from '../../store/actions/userActions';


import { connect } from 'react-redux';

class HeaderComponent extends Component {
  
   newChat = async () => {
    const {user, selectedUsers} = this.props
    try {
      const rooms = await api.getRooms({ name: this.props.chatName });
      if (!rooms.count) {
        selectedUsers.push(user)
        await this.createRoomWithUsers(this.props.chatName, selectedUsers);
        this.props.dispatch(setSelectedUsers([]));
        const room = await api.getRooms({ name: this.props.chatName });
        this.props.history.push(`/chat/${room.items[0]._id}`);
      }
    } catch (err) {
      this.setState({ error: 'Произошла ошибка.' });
    }
  };

  createRoomWithUsers = async (name, users) => {
    try {
      const room = await api.createRoom({ name });
      await Promise.all(users.map(user => this.joinUserToRoom(user._id, room._id)));
    } catch (err) {
      this.setState({ error: 'Произошла при создании комнаты.' });
    }
  };

  joinUserToRoom = async (userId, roomId) => {
    try {
      await api.userJoinRoom(userId, roomId);
    } catch (err) {
      this.setState({ error: 'Произошла ошибка при создании комнаты.' });
    }
  };

  render() {
    let {title, subtitle, type = "chats"} = this.props;
    let size = subtitle ? "lg" : "sm";

    return (

      <div className={`header header_${size}`}>
        <div className="header__left">
          {type === "search" && <SearchInput />}
          {type === "dialog" && <Link to="/chats"><HeaderBtn type="back" txt="Back" /></Link>}
        </div>

        {title && (
          <div className="header__center">
            <HeaderTitle
              title={title}
              subtitle={subtitle}
            />
          </div>
        )}

        <div className="header__right">
          {
            type === "contacts" &&
            (this.props.createChat
            ? <Icon type="header-add" onClick = {this.newChat}/>
            : <Link to="/search"><Icon type="header-add" /></Link>)
          }
          {type === "chats"  && <Link to="/create_chat"><Icon type="header-write" /></Link>}
          {type === "search" && <Link to="/contacts"><Header type='action' txt="Cancel"/></Link>}
          {type === "dialog" && <Avatar size="xsmall" />}
        </div>
      </div>
    );
  }
}

const stateToProps = state => ({
  selectedUsers: state.user.selectedUsers,
  chatName: state.chatName.currentChatName,
  user: state.user.user
});

export const Header = connect(stateToProps)(HeaderComponent);
