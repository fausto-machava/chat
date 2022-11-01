import { useState, useEffect } from 'react';
import { UsersThree, PaperPlaneRight } from 'phosphor-react';
import { io } from 'socket.io-client';


const socket = io.connect('https://backend-six-eta.vercel.app/');
export function Layout() {
    const [name, setName] = useState('');
    const [show, setShow] = useState(false);
    const [showChannelForm, setShowChannelForm] = useState(false);
    const [channelName, setChannelName] = useState();
    const [currentMessage, setCurrentMessage] = useState('');
    const [listMessage, setListMessage] = useState([]);
    const [channelDesc, setChannelDesc] = useState('');
    const [room, setRoom] = useState({
        createdBy: name,
        channel: 'welcome',
        desc: 'Welcome channel'
    });
    const [rooms, setRooms] = useState([{
        createdBy: name,
        channel: 'welcome',
        desc: 'Welcome channel'
    }]);
    


    useEffect(() => {
        socket.on('receive_message', (data) => {
            console.log(data);
            setListMessage([...listMessage, data]);

            sessionStorage.setItem('message', JSON.stringify([...listMessage, data]));
        })

        socket.on('receive_channel', (channel) => {
            setRooms([...rooms, channel]);
            sessionStorage.setItem('rooms', JSON.stringify(rooms));
        });

        const getRooms = async () => {
            await socket.on('rooms', (rooms) => {
                console.log(rooms);
            });
        }

        

        if(sessionStorage.getItem('user') && sessionStorage.getItem('show')){
            setShow(sessionStorage.getItem('show'))
            setName(sessionStorage.getItem('user'))
            console.log(JSON.parse(sessionStorage.getItem('rooms')))
        }

        getRooms();
    }, [rooms, listMessage]);

    const createChannel = async (event) => {
        event.preventDefault();

        const channelData = {
            createdBy: name,
            channel: channelName,
            desc: channelDesc
        }

        socket.emit('create_channel', channelData);
        setRooms((list) => [...list, channelData]);

        sessionStorage.setItem('rooms', JSON.stringify(rooms));

        setChannelName('');
        setChannelDesc('');
    }

    const joinRoom = (event) => {
        event.preventDefault();

        socket.emit('join_room', room.channel);
        setShow(true);

        sessionStorage.setItem('show', true);
        sessionStorage.setItem('user', name);

        socket.emit('getRooms');
    }

    const joinEspRoom = (room) => {
        socket.emit('join_room', room);
    }

    const sendMessage = async (event) => {
        event.preventDefault();

        const messageData = {
            room: room.channel,
            user: name,
            message: currentMessage,
            time: new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes()
        }


        await socket.emit('send_message', messageData);
        setListMessage((list) => [...list, messageData]);
        setCurrentMessage('');

        sessionStorage.setItem('message', JSON.stringify([...listMessage, messageData]));
    }

    return (
        <>
            {!show ?
                (<div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 p-10">
                    <h1 className="text-3xl font-bold text-black mb-8">Bem vindo ao Chat</h1>

                    <form onSubmit={joinRoom} className="flex flex-col gap-8 p-20 bg-white shadow-lg">
                        <div className="flex flex-col gap-3">
                            <label htmlFor="name">Nome</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="px-6 py-3 text-gray-700 bg-gray-200 outline-none"
                                id="name"
                                type="text"
                                placeholder="Insira o seu nome"
                            />
                        </div>

                        <button
                            className="bg-blue-500 transition-colors hover:bg-blue-700 text-white font-bold py-4"
                        >
                            Entrar
                        </button>
                    </form>
                </div>)
                : (<>
                    <div className='min-h-screen'>
                        <div className="container mx-auto shadow-lg rounded-lg flex flex-col min-h-screen">

                            <div className="px-5 py-5 flex justify-between items-center bg-white border-b-2 h-full">
                                <div>
                                    <div className="font-semibold text-2xl">Chat</div>
                                </div>

                                <div
                                    className=" font-semibold flex items-center justify-center"
                                >
                                    {name}
                                </div>
                            </div>

                            <div className="flex flex-row justify-between bg-white flex-1">

                                <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">

                                    <div className="border-b-2 py-4 px-2">
                                        <input
                                            type="text"
                                            placeholder="Procurar canal"
                                            className="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
                                        />
                                    </div>

                                    {rooms.map((room, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setRoom(room)
                                                joinEspRoom(room.channel)
                                            }}
                                            className="flex flex-row py-4 px-2 justify-center items-center border-b-2"
                                        >
                                            <div className="w-full px-2">

                                                <div className="text-lg font-semibold">{room.channel}</div>

                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className='fixed bottom-3 right-3'>
                                    {showChannelForm
                                        &&
                                        <div className='bg-white p-8 shadow-lg'>
                                            <strong className='text-xl'>Adicionar canal</strong>
                                            <form onSubmit={createChannel}>
                                                <input
                                                    type="text"
                                                    placeholder='Insira o nome do canal'
                                                    className='w-full bg-gray-300 py-5 px-3 rounded-xl mb-2'
                                                    value={channelName}
                                                    onChange={(e) => setChannelName(e.target.value)}
                                                />

                                                <textarea
                                                    name="canalDescricao"
                                                    id=""
                                                    cols="5"
                                                    rows="5"
                                                    placeholder='Insira a descricao do canal'
                                                    className='w-full bg-gray-300 py-5 px-3 rounded-xl'
                                                    onChange={(e) => setChannelDesc(e.target.value)}
                                                    value={channelDesc}
                                                ></textarea>

                                                <button
                                                    type='submit'
                                                    className='p-4 bg-blue-600 rounded text-white'
                                                >Adicionar</button>
                                            </form>
                                        </div>
                                    }
                                    <button onClick={() => setShowChannelForm(!showChannelForm)} className='p-4 bg-blue-600 rounded shadow float-right'>
                                        <UsersThree size={20} color={'#fff'} />
                                    </button>
                                </div>

                                <div className="w-full px-5 flex flex-col justify-between">
                                    <div className="flex flex-col mt-5">
                                        {listMessage.map((message, index) => message.room === room.channel && (
                                            <div key={index} className={`${message.user == name ? 'justify-end' : 'justify-start'} flex mb-4`}>
                                                <div
                                                    className={`${message.user == name ? 'bg-blue-400' : 'bg-gray-400'} flex flex-col gap-2 mr-2 py-3 px-4 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white`}
                                                >
                                                    {message.user == name ?
                                                        ''
                                                        :
                                                        <strong className='font-semibold text-white'>{message.user}</strong>
                                                    }
                                                    {message.message}
                                                    <span className="text-xs text-white leading-none">{message.time}</span>
                                                </div>


                                            </div>
                                        ))}
                                    </div>
                                    <div className="py-5">
                                        <form className='flex items-center gap-4' onSubmit={sendMessage}>
                                            <input
                                                className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                                                onChange={(e) => setCurrentMessage(e.target.value)}
                                                type="text"
                                                value={currentMessage}
                                                placeholder="Escreva a sua mensagem aqui." />
                                            <button
                                                type='submit'
                                                className="bg-blue-500 transition-colors hover:bg-blue-700 text-white font-bold rounded-full p-4"
                                            >
                                                <PaperPlaneRight size={20} color='#fff' weight='fill' />
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                <div className="w-2/5 border-l-2 px-5">
                                    <div className="flex flex-col">
                                        <div className="font-semibold text-xl py-4">{room.channel}</div>
                                        <div className="font-light">
                                            {room.desc}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>)}
        </>
    )
};