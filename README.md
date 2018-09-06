# Teamkerbell Chatting - Server

## Introduction
> 대학생 팀플 협업 도구 팀커벨의 채팅 서버입니다.
- 사용자는 여러 그룹에 속할 수 있습니다.
- 하나의 그룹에는 여러 채팅방이 존재하고, 그 채팅방별로 여러 작업(공지, 신호등, 투표, 역할)을 수행할 수 있습니다.

## Main Function
- 채팅방 리스트 : 하나의 그룹에 있는 모든 채팅방을 실시간으로 확인하고 
- 채팅방 : 채팅 창에서 채팅 기능을 통해 실시간으로 팀 구성원들과 통신 할 수 있습니다.
- 푸시알림 : fcm을 통해 사용자가 속한 채팅방에서 메시지가 등록되면 사용자에게 푸시 알림을 보내줍니다.
- 읽음 수 체크 : 메시지가 등록될 경우, 그 채팅방에 들어와 있는 사용자의 수를 이용해 읽지 않은 카운트를 등록해줍니다. 채빙방에 들어갈 경우, 사용자가 읽은 마지막 메시지 인덱스를 불러와 읽음 수 체크를 합니다. 
- 페이징 : 일정 수의 채팅 메시지만 보내고, 추가적으로 필요할 경우 이전의 채팅 기록을 보내줍니다.


## Spec
> Native application for IOS, Android users.
- Front-End : IOS, Android
- Back-End : NodeJS, AWS Infra, MySQL

## modules

* [socket.io](https://github.com/socketio/socket.io)

* [fcm](https://www.npmjs.com/package/fcm-node)

* [moment](https://github.com/moment)
