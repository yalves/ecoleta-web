import React, { useEffect, useState, ChangeEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';

interface item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
    id: number;
}

interface IBGECityResponse {
    nome: string;
    id: number;
}

interface city {
    name: string;
    id: number;
}

const CreatePoint = () => {
    const [items, setItems] = useState<item[]>([]);
    const [ufInitials, setUfInitials] = useState<string[]>([]);
    const [cities, setCities] = useState<city[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude,  longitude} = position.coords;

            setInitialPosition([latitude, longitude]);
            setSelectedPosition([latitude, longitude]);
        })
    }, [])

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfInitials(ufInitials);
        })
    }, []);

    useEffect(() => {
        if(selectedUf === '0') {
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos`).then(response => {
            const cities = response.data.map(city => { 
                return { 
                    name:city.nome, 
                    id:city.id 
                }
            });

            setCities(cities);
        })
    }, [selectedUf]);

    function HandleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function HandleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function HandleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name"/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">E-mail</label>
                            <input type="email" name="email" id="email"/>
                        </div>
                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp"/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    
                    <Map center={initialPosition} zoom={15} onClick={HandleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}></Marker>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado(UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={HandleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufInitials.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city" 
                                value={selectedCity} 
                                onChange={HandleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.name}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint;