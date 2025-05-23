# decentrathon rtmp frontend

a next.js application for managing rtmp streams for decentrathon.

## english documentation

### features

- create and manage rtmp test streams
- monitor active streams
- copy rtmp urls for streaming software

### requirements

- node.js (18.x or later)
- npm or yarn

### getting started

1. install dependencies:

```bash
npm install
# or
yarn install
```

2. start the development server:

```bash
npm run dev
# or
yarn dev
```

3. open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### configuration

set the backend api url in your `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### usage

the application provides a simple interface to:

- create test rtmp streams with custom names
- view active streams with their rtmp urls
- stop running streams
- refresh the stream list
- copy rtmp urls to clipboard

### development

this project uses:

- next.js 14 with app router
- typescript
- tailwind css
- shadcn/ui components

edit the application:
- pages are in `src/app/`
- components are in `src/components/`
- styles are in `src/app/globals.css`

### deployment

deploy the application using vercel or any next.js compatible hosting:

```bash
npm run build
npm run start
```

## русская документация

### функции

- создание и управление тестовыми rtmp потоками
- мониторинг активных потоков
- копирование rtmp url для программ трансляции

### требования

- node.js (18.x или новее)
- npm или yarn

### начало работы

1. установите зависимости:

```bash
npm install
# или
yarn install
```

2. запустите сервер разработки:

```bash
npm run dev
# или
yarn dev
```

3. откройте [http://localhost:3000](http://localhost:3000) в вашем браузере для просмотра приложения.

### конфигурация

укажите url backend api в вашем файле `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### использование

приложение предоставляет простой интерфейс для:

- создания тестовых rtmp потоков с пользовательскими именами
- просмотра активных потоков с их rtmp адресами
- остановки работающих потоков
- обновления списка потоков
- копирования rtmp адресов в буфер обмена

### разработка

этот проект использует:

- next.js 14 с app router
- typescript
- tailwind css
- компоненты shadcn/ui

редактирование приложения:
- страницы находятся в `src/app/`
- компоненты в `src/components/`
- стили в `src/app/globals.css`

### развертывание

разверните приложение с помощью vercel или любого хостинга, совместимого с next.js:

```bash
npm run build
npm run start
```
