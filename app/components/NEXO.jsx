import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Building2, LayoutDashboard, Inbox, BarChart3, Settings, LogOut, Search, Plus,
  Bell, Filter, ChevronDown, Paperclip, Clock, AlertTriangle, CheckCircle2,
  ArrowLeft, Send, User, Mail, Tag, MapPin, Star, Circle, ShieldCheck, X
} from "lucide-react";

const DATA = {"cats": [{"rol": "JOP", "categoria": "Administración y Personas", "subcategoria": "Aprobaciones propietarios", "dias": 3, "horas": 72, "prioridad": "Urgente"}, {"rol": "JOP", "categoria": "Administración y Personas", "subcategoria": "Compras", "dias": 3, "horas": 72, "prioridad": "Alta"}, {"rol": "JOP", "categoria": "Atención al Cliente", "subcategoria": "Atención al cliente", "dias": 2, "horas": 48, "prioridad": "Alta"}, {"rol": "JOP", "categoria": "Atención al Cliente", "subcategoria": "Atención al cliente postventa", "dias": 15, "horas": 360, "prioridad": "Alta"}, {"rol": "JOP", "categoria": "Comercial y Arriendo", "subcategoria": "Cupones", "dias": 2, "horas": 48, "prioridad": "Urgente"}, {"rol": "JOP", "categoria": "Comercial y Arriendo", "subcategoria": "Demand", "dias": 2, "horas": 48, "prioridad": "Media"}, {"rol": "JOP", "categoria": "Comercial y Arriendo", "subcategoria": "Rotaciones", "dias": 3, "horas": 72, "prioridad": "Alta"}, {"rol": "JOP", "categoria": "Comunicación Interna", "subcategoria": "Bajada de información al JEM", "dias": 2, "horas": 48, "prioridad": "Urgente"}, {"rol": "JOP", "categoria": "Gestión de Cobranza", "subcategoria": "Cobranzas", "dias": 2, "horas": 48, "prioridad": "Media"}, {"rol": "JOP", "categoria": "Gestión de Cobranza", "subcategoria": "Solicitud de Descerraje", "dias": 3, "horas": 72, "prioridad": "Urgente"}, {"rol": "JOP", "categoria": "Legal y Contratos", "subcategoria": "Requerimientos legales", "dias": 2, "horas": 48, "prioridad": "Alta"}, {"rol": "JOP", "categoria": "Mantención y Reparaciones", "subcategoria": "Requerimientos de mantención", "dias": 3, "horas": 72, "prioridad": "Media"}, {"rol": "JOP", "categoria": "Reclamos Prioritarios", "subcategoria": "Sernac", "dias": 3, "horas": 72, "prioridad": "Urgente"}, {"rol": "JOP", "categoria": "Reclamos Prioritarios", "subcategoria": "Reclamos.cl", "dias": 3, "horas": 72, "prioridad": "Urgente"}, {"rol": "JOP", "categoria": "Reclamos Prioritarios", "subcategoria": "Redes Sociales", "dias": null, "horas": 4, "prioridad": "Urgente"}, {"rol": "JOP", "categoria": "Seguridad y Prevención", "subcategoria": "Prevención de riesgos", "dias": 2, "horas": 48, "prioridad": "Alta"}, {"rol": "JOP", "categoria": "Seguros", "subcategoria": "Seguros", "dias": 15, "horas": 360, "prioridad": "Baja"}, {"rol": "JEM", "categoria": "Personas", "subcategoria": "Recursos Humanos", "dias": 2, "horas": 48, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Atención al Cliente", "subcategoria": "Atención Urgente al cliente", "dias": 1, "horas": 24, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Atención al Cliente", "subcategoria": "Gestión de reclamo", "dias": 1, "horas": 24, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Comunicación Interna", "subcategoria": "Bajada de información al Equipo", "dias": 1, "horas": 24, "prioridad": "Urgente"}, {"rol": "JEM", "categoria": "Gestión de Cobranza", "subcategoria": "Gestión de Cobranza", "dias": 2, "horas": 48, "prioridad": "Media"}, {"rol": "JEM", "categoria": "Gestión de Rotaciones", "subcategoria": "Emisión de Salvoconducto", "dias": 1, "horas": 24, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Gestión de Rotaciones", "subcategoria": "Emisión de Check Out", "dias": 1, "horas": 24, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Legal y Contratos", "subcategoria": "Contratos", "dias": 2, "horas": 48, "prioridad": "Media"}, {"rol": "JEM", "categoria": "Legal y Contratos", "subcategoria": "Legal", "dias": 2, "horas": 48, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Mantención y Reparaciones", "subcategoria": "Reparaciones", "dias": 3, "horas": 72, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Mantención y Reparaciones", "subcategoria": "Mantenciones", "dias": 3, "horas": 72, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Reclamos Prioritarios", "subcategoria": "Sernac", "dias": 2, "horas": 48, "prioridad": "Urgente"}, {"rol": "JEM", "categoria": "Reclamos Prioritarios", "subcategoria": "Reclamos.cl", "dias": 2, "horas": 48, "prioridad": "Urgente"}, {"rol": "JEM", "categoria": "Reclamos Prioritarios", "subcategoria": "Redes Sociales", "dias": null, "horas": 2, "prioridad": "Urgente"}, {"rol": "JEM", "categoria": "Seguridad y Prevención", "subcategoria": "Simulacros", "dias": 3, "horas": 72, "prioridad": "Media"}, {"rol": "JEM", "categoria": "Seguridad y Prevención", "subcategoria": "Seguridad", "dias": 3, "horas": 72, "prioridad": "Alta"}, {"rol": "JEM", "categoria": "Seguridad y Prevención", "subcategoria": "Certificaciones", "dias": 3, "horas": 72, "prioridad": "Media"}, {"rol": "JEM", "categoria": "Sistemas Visitas y Encomiendas", "subcategoria": "Encomiendas", "dias": 1, "horas": 24, "prioridad": "Baja"}, {"rol": "JEM", "categoria": "Sistemas Visitas y Encomiendas", "subcategoria": "Visitas", "dias": 1, "horas": 24, "prioridad": "Baja"}], "buildings": [{"id": 1, "nombre": "Alameda Park", "jem": "Atilio Rios", "jemCorreo": "alamedapark@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 299, "propietario": "BTG"}, {"id": 2, "nombre": "Alma Hipodromo", "jem": "Bruno Garcia", "jemCorreo": "almahipodromo@apcomunidades.cl", "jop": "Maria Victoria Montiel", "jopCorreo": "maria.montiel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 133, "propietario": "Bunster"}, {"id": 3, "nombre": "Amengual", "jem": "Maria Gabriela Mercado", "jemCorreo": "amengual@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 271, "propietario": "Triple I"}, {"id": 4, "nombre": "Pio X", "jem": "Daniela Flores", "jemCorreo": "piox@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Providencia", "deptos": 132, "propietario": "Eduardo Schapira"}, {"id": 5, "nombre": "Conecta Despouy", "jem": "Edgar Marin", "jemCorreo": "despouy@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Cisterna", "deptos": 272, "propietario": "Sura"}, {"id": 6, "nombre": "Mirador José Ureta", "jem": "Diego Del Re", "jemCorreo": "joseureta@apcomunidades.cl", "jop": "Maria Victoria Montiel", "jopCorreo": "maria.montiel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Cisterna", "deptos": 227, "propietario": "Gensa"}, {"id": 7, "nombre": "Edificio San Carlos", "jem": "Jorge Garces", "jemCorreo": "sancarlos@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 111, "propietario": "Zurich"}, {"id": 8, "nombre": "Activa Juan Mitjans", "jem": "Yoleida Jervis", "jemCorreo": "mitjans@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Macul", "deptos": 165, "propietario": "Parque Arauco"}, {"id": 9, "nombre": "Vicuña Urban", "jem": "Wendy Gaita", "jemCorreo": "vicunaurban@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 262, "propietario": "Larraín Vial"}, {"id": 10, "nombre": "Antonia", "jem": "Jose Santamaria", "jemCorreo": "antonia@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 73, "propietario": "German Guerrero"}, {"id": 11, "nombre": "Matucana", "jem": "Greily peraza", "jemCorreo": "matucana@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 233, "propietario": "Teodora"}, {"id": 12, "nombre": "Pedro de Valdivia", "jem": "Laura Fernandez", "jemCorreo": "pedrodevaldivia@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Ñuñoa", "deptos": 56, "propietario": "Grupo Caltex"}, {"id": 13, "nombre": "Torres de Vicuña Mackenna", "jem": "Dayana Conde", "jemCorreo": "tvm@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 519, "propietario": "Altos La Florida"}, {"id": 14, "nombre": "Alvarez Toledo", "jem": "Carifer Moya", "jemCorreo": "alvarezdetoledo@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "San Miguel", "deptos": 152, "propietario": "Zurich"}, {"id": 15, "nombre": "Factoria Italia", "jem": "Alexis Medina", "jemCorreo": "factoriaitalia@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Providencia", "deptos": 56, "propietario": "Eduardo Schapira"}, {"id": 16, "nombre": "Mirador Gamero", "jem": "José Martínez", "jemCorreo": "gamero@apcomunidades.cl", "jop": "Maria Victoria Montiel", "jopCorreo": "maria.montiel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 170, "propietario": "Gensa"}, {"id": 17, "nombre": "Mirador Capital", "jem": "Genesis lopez", "jemCorreo": "miradorcapital@apcomunidades.cl", "jop": "Aniuska Castillo", "jopCorreo": "aniuska.castillo@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 165, "propietario": "Ingevec"}, {"id": 18, "nombre": "Santo Domingo", "jem": "Lizette Flores", "jemCorreo": "santodomingo@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Quinta Normal", "deptos": 204, "propietario": "Metlife"}, {"id": 19, "nombre": "Concon", "jem": "Andrea Melandri", "jemCorreo": "concon@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 298, "propietario": "Parque Arauco"}, {"id": 20, "nombre": "Plaza Conde del Maule", "jem": "Marinella Marinacci", "jemCorreo": "condedelmaule@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 374, "propietario": "ISA"}, {"id": 21, "nombre": "Portugal", "jem": "Miguel Párraga", "jemCorreo": "fraycamilo@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 296, "propietario": "Triple I"}, {"id": 22, "nombre": "Echaurren", "jem": "Maria jose", "jemCorreo": "echaurren@apcomunidades.cl", "jop": "Maria Victoria Montiel", "jopCorreo": "maria.montiel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 191, "propietario": "Triple I"}, {"id": 23, "nombre": "Las Verbenas", "jem": "Luis Gutierrez", "jemCorreo": "lasverbenas@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Las Condes", "deptos": 56, "propietario": "Santa Cruz"}, {"id": 24, "nombre": "Lofty", "jem": "Loraine Mosquera Hamburger", "jemCorreo": "lofty@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 270, "propietario": "EJE"}, {"id": 25, "nombre": "Activa Bezanilla", "jem": "Viviana Muñoz", "jemCorreo": "activabezanilla@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 119, "propietario": "Activa"}, {"id": 26, "nombre": "Activa Cerro Blanco", "jem": "Eduardo Villota", "jemCorreo": "activacerroblanco@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Recoleta", "deptos": 163, "propietario": "Activa"}, {"id": 27, "nombre": "Activa Vicuña Mackenna", "jem": "Carlos Gonzalez", "jemCorreo": "activavicuna@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 380, "propietario": "Activa"}, {"id": 28, "nombre": "Alférez Real", "jem": "Liseth Garcia", "jemCorreo": "alferezreal@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Providencia", "deptos": 62, "propietario": "Gensa"}, {"id": 29, "nombre": "Alto Conde", "jem": "Huilfer Martinez Romero", "jemCorreo": "altoconde@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 842, "propietario": "BTG"}, {"id": 30, "nombre": "Augusto Leguia", "jem": "Yael García", "jemCorreo": "augustoleguia@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Las Condes", "deptos": 56, "propietario": "Eduardo Schapira"}, {"id": 31, "nombre": "Carnot", "jem": "Fabian Pignone", "jemCorreo": "carnot@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "San Miguel", "deptos": 428, "propietario": "Sura"}, {"id": 32, "nombre": "Carrera Capital", "jem": "Jaclyn Sánchez", "jemCorreo": "carreracapital@apcomunidades.cl", "jop": "Aniuska Castillo", "jopCorreo": "aniuska.castillo@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 257, "propietario": "Ingevec"}, {"id": 33, "nombre": "Casa el Roble", "jem": "Benjamín Sepúlveda Rojas", "jemCorreo": "casaelroble@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 299, "propietario": "Angelini"}, {"id": 34, "nombre": "Claudio Gay", "jem": "Mario Ruffo", "jemCorreo": "claudiogay@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 244, "propietario": "Regenera"}, {"id": 35, "nombre": "Edificio Altavista", "jem": "Natassha Gutierrez", "jemCorreo": "isabelriquelme@apcomunidades.cl", "jop": "Maria Victoria Montiel", "jopCorreo": "maria.montiel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "San Joaquín", "deptos": 250, "propietario": "Boetsch"}, {"id": 36, "nombre": "Cinco de Abril", "jem": "Victor Albarracin", "jemCorreo": "cincodeabril@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 300, "propietario": "Santander"}, {"id": 37, "nombre": "Edificio Colón", "jem": "Luisa Díaz Mora", "jemCorreo": "colon@apcomunidades.cl", "jop": "Ariyari Chacín", "jopCorreo": "ariyari.chacin@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 386, "propietario": "BTG"}, {"id": 38, "nombre": "Nueva Independencia", "jem": "Juan Camilo Perez", "jemCorreo": "nuevaindependencia@apcomunidades.cl", "jop": "Ariyari Chacín", "jopCorreo": "ariyari.chacin@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 581, "propietario": "BTG"}, {"id": 39, "nombre": "Parque Brasil", "jem": "Isabella Mellado", "jemCorreo": "parquebrasil@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Renca", "deptos": 162, "propietario": "Valorarte"}, {"id": 40, "nombre": "San Isidro 543", "jem": "Anais Valle Montero", "jemCorreo": "fagnano@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 298, "propietario": "Paz"}, {"id": 41, "nombre": "Edificio San Luis", "jem": "Freddy Araujo", "jemCorreo": "sanluisbtg@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 258, "propietario": "BTG"}, {"id": 42, "nombre": "Edificio Santa Rosa", "jem": "Luis Chauran", "jemCorreo": "santarosa@apcomunidades.cl", "jop": "Ariyari Chacín", "jopCorreo": "ariyari.chacin@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 173, "propietario": "BTG"}, {"id": 43, "nombre": "Su Independencia", "jem": "Luis Jiménez", "jemCorreo": "suindependencia@apcomunidades.cl", "jop": "Ariyari Chacín", "jopCorreo": "ariyari.chacin@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 704, "propietario": "BTG"}, {"id": 44, "nombre": "Vive Independencia", "jem": "Jean Paul Urra", "jemCorreo": "viveindependencia@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 225, "propietario": "BTG"}, {"id": 45, "nombre": "Era", "jem": "Angel Figuera", "jemCorreo": "sanluis@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Cisterna", "deptos": 238, "propietario": "Vantrust"}, {"id": 46, "nombre": "Espacio Oriente", "jem": "Christian Reyes", "jemCorreo": "espacioriente@apcomunidades.cl", "jop": "Ariyari Chacín", "jopCorreo": "ariyari.chacin@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 344, "propietario": "BTG"}, {"id": 47, "nombre": "Exequiel Fernandez", "jem": "Jessica Polanco", "jemCorreo": "exequielfernandez@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Ñuñoa", "deptos": 173, "propietario": "Larrain Prieto"}, {"id": 48, "nombre": "FAM Huemul", "jem": "Jessie Fabiana Guilarte Hurtado", "jemCorreo": "huemul@apcomunidades.cl", "jop": "Maria Victoria Montiel", "jopCorreo": "maria.montiel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 183, "propietario": "Fundamenta"}, {"id": 49, "nombre": "Florida Capital", "jem": "Briseyda Marval", "jemCorreo": "floridacapital@apcomunidades.cl", "jop": "Aniuska Castillo", "jopCorreo": "aniuska.castillo@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 253, "propietario": "Ingevec"}, {"id": 50, "nombre": "Garden La Cisterna", "jem": "Yerisay Hernández", "jemCorreo": "garden@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Cisterna", "deptos": 168, "propietario": "Larrain Vial"}, {"id": 51, "nombre": "Guardiamarina", "jem": "Keyla Jiménez", "jemCorreo": "guardiamarina@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "San Miguel", "deptos": 203, "propietario": "Toesca"}, {"id": 52, "nombre": "Guillermo Mann B", "jem": "Dariesel Urdaneta", "jemCorreo": "guillermomann@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Ñuñoa", "deptos": 409, "propietario": "Penta"}, {"id": 53, "nombre": "Guillermo Mann C", "jem": "Dariesel Urdaneta", "jemCorreo": "guillermomann@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Ñuñoa", "deptos": 409, "propietario": "Penta"}, {"id": 54, "nombre": "Home Inclusive Carmen", "jem": "Ayleen Letelier", "jemCorreo": "carmen@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 298, "propietario": "Ralei"}, {"id": 55, "nombre": "Home Inclusive Ecuador", "jem": "Ignacio Jimenez", "jemCorreo": "ecuador@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 299, "propietario": "Ralei"}, {"id": 56, "nombre": "Home Inclusive Ejército", "jem": "Uri Polanco", "jemCorreo": "ejercito@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 123, "propietario": "Ralei"}, {"id": 57, "nombre": "Home Inclusive Independencia", "jem": "Julio Gonzalez", "jemCorreo": "independencia@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Independencia", "deptos": 810, "propietario": "Ralei"}, {"id": 58, "nombre": "Home Inclusive Manuel Rodriguez", "jem": "Ruben Barrios", "jemCorreo": "manuelrodriguez@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 372, "propietario": "Ralei"}, {"id": 59, "nombre": "Lazo", "jem": "Maria Fernanda Tovar", "jemCorreo": "lazo@apcomunidades.cl", "jop": "Salvador Fasanella", "jopCorreo": "salvador.fasanella@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo Local", "comuna": "San Miguel", "deptos": 280, "propietario": "Varios"}, {"id": 60, "nombre": "MAT", "jem": "Jose Ignacio Lazo", "jemCorreo": "tocornal@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 124, "propietario": "Santander"}, {"id": 61, "nombre": "Midtown Santiago", "jem": "Albert Borges", "jemCorreo": "midtown@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 436, "propietario": "Larraín Vial"}, {"id": 62, "nombre": "Morande Sur", "jem": "Andrea Grau", "jemCorreo": "morande@apcomunidades.cl", "jop": "Sergio Maldonado", "jopCorreo": "sergio.maldonado@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 210, "propietario": "AJ Urbana"}, {"id": 63, "nombre": "Nueva Valdés", "jem": "Angel Marquez", "jemCorreo": "nuevavaldes@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 224, "propietario": "Ariel Fucks"}, {"id": 64, "nombre": "Nuevo Oriente I", "jem": "Arianni Rodríguez Arrieta", "jemCorreo": "nuevoriente@apcomunidades.cl", "jop": "Ariyari Chacín", "jopCorreo": "ariyari.chacin@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 425, "propietario": "BTG"}, {"id": 65, "nombre": "Nuevo Oriente II", "jem": "Arianni Rodríguez Arrieta", "jemCorreo": "nuevoriente@apcomunidades.cl", "jop": "Ariyari Chacín", "jopCorreo": "ariyari.chacin@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 119, "propietario": "BTG"}, {"id": 66, "nombre": "Placilla", "jem": "Marcos Bracho", "jemCorreo": "placilla@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 286, "propietario": "Toesca"}, {"id": 67, "nombre": "Plaza Central", "jem": "Jorge Vaquero", "jemCorreo": "plazacentral@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Estación Central", "deptos": 716, "propietario": "BTG"}, {"id": 68, "nombre": "Romero", "jem": "Richard Marquez", "jemCorreo": "romero@apcomunidades.cl", "jop": "Maria Victoria Montiel", "jopCorreo": "maria.montiel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 126, "propietario": "Boetsch"}, {"id": 69, "nombre": "Sazié", "jem": "Krysthoferd Molero", "jemCorreo": "sazie@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 112, "propietario": "Santander"}, {"id": 70, "nombre": "Serrano Capital", "jem": "Sidi Carrasco", "jemCorreo": "serranocapital@apcomunidades.cl", "jop": "Aniuska Castillo", "jopCorreo": "aniuska.castillo@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 275, "propietario": "Ingevec"}, {"id": 71, "nombre": "Stage San Diego", "jem": "Maryoris Narvaez", "jemCorreo": "stage@apcomunidades.cl", "jop": "Anthoyne González", "jopCorreo": "anthoyne.gonzalez@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 188, "propietario": "Larrain Vial"}, {"id": 72, "nombre": "Toledo Rent", "jem": "Joseph Gonzalez", "jemCorreo": "toledorent@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "San Miguel", "deptos": 245, "propietario": "Echeverria"}, {"id": 73, "nombre": "Urbana 30", "jem": "Angel Ricardo", "jemCorreo": "urbana@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 38, "propietario": "JC Torres"}, {"id": 74, "nombre": "Urbana 35", "jem": "Angel Ricardo", "jemCorreo": "urbana@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 27, "propietario": "JC Torres"}, {"id": 75, "nombre": "Vespucio Capital", "jem": "Albany Perez", "jemCorreo": "vespuciocapital@apcomunidades.cl", "jop": "Aniuska Castillo", "jopCorreo": "aniuska.castillo@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "La Florida", "deptos": 299, "propietario": "Ingevec"}, {"id": 76, "nombre": "Vicuña Capital", "jem": "Luis Manuel Bolívar Venegas", "jemCorreo": "vicunacapital@apcomunidades.cl", "jop": "Aniuska Castillo", "jopCorreo": "aniuska.castillo@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 285, "propietario": "Ingevec"}, {"id": 77, "nombre": "Vista Parque", "jem": "Adriana Trocelis", "jemCorreo": "vistaparque@apcomunidades.cl", "jop": "Joel Zavarce", "jopCorreo": "joel.zavarce@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Ñuñoa", "deptos": 224, "propietario": "Angelini"}, {"id": 78, "nombre": "Vive Santa Isabel", "jem": "Oscar Dias", "jemCorreo": "vivesantaisabel@apcomunidades.cl", "jop": "Sergio Maldonado", "jopCorreo": "sergio.maldonado@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo Local", "comuna": "Santiago", "deptos": 180, "propietario": "AJ Urbana"}, {"id": 79, "nombre": "Zañartu Capital", "jem": "Maria Macuart", "jemCorreo": "zanartucapital@apcomunidades.cl", "jop": "Aniuska Castillo", "jopCorreo": "aniuska.castillo@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Ñuñoa", "deptos": 295, "propietario": "Ingevec"}, {"id": 80, "nombre": "Borgetto", "jem": "Lorena Rojas", "jemCorreo": "borgetto@apcomunidades.cl", "jop": "Jermayn Goncalves", "jopCorreo": "jermayn.goncalves@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo Local", "comuna": "Quinta Normal", "deptos": 297, "propietario": "German Guerrero"}, {"id": 81, "nombre": "Mirador Azul", "jem": "Cosme Nieves", "jemCorreo": "miradorazul@apcomunidades.cl", "jop": "Kandy Mata", "jopCorreo": "kandy.mata@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo tradicional", "comuna": "La Florida", "deptos": 125, "propietario": "Activa"}, {"id": 82, "nombre": "Maestra Gabriela", "jem": "Hector Uzcategui", "jemCorreo": "maestragabriela@apcomunidades.cl", "jop": "Salvador Fasanella", "jopCorreo": "salvador.fasanella@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo tradicional", "comuna": "Puente Alto", "deptos": 80, "propietario": "Roca Azul"}, {"id": 83, "nombre": "Barrio Juan de Pineda", "jem": "Barrio Juan de Pineda", "jemCorreo": "juandepineda@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo tradicional", "comuna": "La Florida", "deptos": 54, "propietario": "Vive Tu Barrio"}, {"id": 84, "nombre": "Barrio Teresa Vial", "jem": "Barrio Teresa Vial", "jemCorreo": "teresavial@apcomunidades.cl", "jop": "Andrea Matheus", "jopCorreo": "andrea.matheus@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo tradicional", "comuna": "San Miguel", "deptos": 66, "propietario": "Vive Tu Barrio"}, {"id": 85, "nombre": "Edificio Santiago", "jem": "Edificio Santiago", "jemCorreo": "santiago1221@apcomunidades.cl", "jop": "Marian Villarroel", "jopCorreo": "mariam.villarroel@assetplan.cl", "tipo": "Multifamily", "modelo": "Modelo tradicional", "comuna": "Santiago", "deptos": 55, "propietario": "Alberto Rozas"}, {"id": 86, "nombre": "Vista San Martín", "jem": "Vista San Martín", "jemCorreo": "sanmartin@apcomunidades.cl", "jop": "Sergio Maldonado", "jopCorreo": "sergio.maldonado@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "Santiago", "deptos": 270, "propietario": "AJ Urbana"}, {"id": 87, "nombre": "Activa Plaza Chacabuco", "jem": "Rosalia Rojas", "jemCorreo": "plazachacabuco@apcomunidades.cl", "jop": "Salvador Fasanella", "jopCorreo": "salvador.fasanella@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "Independencia", "deptos": 170, "propietario": "Activa"}, {"id": 88, "nombre": "Bélgica", "jem": "Vanesa Achique", "jemCorreo": "belgica@apcomunidades.cl", "jop": "Sergio Maldonado", "jopCorreo": "sergio.maldonado@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "Independencia", "deptos": 233, "propietario": "Santa Elisa"}, {"id": 89, "nombre": "Activa Dominica", "jem": "Ramon Sanchez", "jemCorreo": "activadominica@apcomunidades.cl", "jop": "Salvador Fasanella", "jopCorreo": "salvador.fasanella@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "Recoleta", "deptos": 108, "propietario": "Activa"}, {"id": 90, "nombre": "Conquista Yazigi", "jem": "Carmen España", "jemCorreo": "yazigi@apcomunidades.cl", "jop": "Salvador Fasanella", "jopCorreo": "salvador.fasanella@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "Conchalí", "deptos": 434, "propietario": "Varios"}, {"id": 91, "nombre": "Lia Aguirre", "jem": "Oscar Dias", "jemCorreo": "lia.aguirre@apcomunidades.cl", "jop": "Sergio Maldonado", "jopCorreo": "sergio.maldonado@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "La Florida", "deptos": 189, "propietario": "AJ Urbana"}, {"id": 92, "nombre": "Mirador Casona", "jem": "Miguel Quintero", "jemCorreo": "miradorcasona@apcomunidades.cl", "jop": "Salvador Fasanella", "jopCorreo": "salvador.fasanella@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "La Florida", "deptos": 250, "propietario": "Exacon"}, {"id": 93, "nombre": "Santa Elvira", "jem": "Pedro Garcia", "jemCorreo": "santaelvira@apcomunidades.cl", "jop": "Sergio Maldonado", "jopCorreo": "sergio.maldonado@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "Santiago", "deptos": 258, "propietario": "Paz"}, {"id": 94, "nombre": "Morande Norte", "jem": "Roberto Cárcamo", "jemCorreo": "morandenorte@apcomunidades.cl", "jop": "Sergio Maldonado", "jopCorreo": "sergio.maldonado@assetplan.cl", "tipo": "Eleva", "modelo": "Modelo tradicional", "comuna": "Santiago", "deptos": 293, "propietario": "AJ Urbana"}], "users": [{"nombre": "Dayana Figueroa", "correo": "dayana.figueroa@assetplan.cl", "cargo": "Líder de Proyecto", "permiso": "Dueño", "role": "dueno", "area": "", "edificios": []}, {"nombre": "Marlyn Melendez", "correo": "marlyn.melendez@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Administrador", "role": "admin", "area": "", "edificios": []}, {"nombre": "Daniel Chacón", "correo": "daniel.chacon@assetplan.cl", "cargo": "Subgerente de Operaciones", "permiso": "Administrador", "role": "admin", "area": "", "edificios": []}, {"nombre": "Gonzalo Cabezas", "correo": "gonzalo.cabezas@assetplan.cl", "cargo": "Gerente de Edificios", "permiso": "Administrador", "role": "admin", "area": "", "edificios": []}, {"nombre": "Maria Eugenia Pacheco", "correo": "maria.pacheco@assetplan.cl", "cargo": "Jefe Backoffice", "permiso": "Administrador", "role": "admin", "area": "", "edificios": []}, {"nombre": "Francisco Egidi", "correo": "francisco.egidi@assetplan.cl", "cargo": "Jefe Atención y Experiencia", "permiso": "Administrador", "role": "admin", "area": "", "edificios": []}, {"nombre": "Salvador Fasanella", "correo": "salvador.fasanella@assetplan.cl", "cargo": "Jefe Eleva", "permiso": "Administrador", "role": "admin", "area": "", "edificios": ["Lazo", "Maestra Gabriela", "Activa Plaza Chacabuco", "Activa Dominica", "Conquista Yazigi", "Mirador Casona"]}, {"nombre": "Andrea Matheus", "correo": "andrea.matheus@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Matucana", "Portugal", "Casa el Roble", "Claudio Gay", "Parque Brasil", "Nueva Valdés", "Barrio Juan de Pineda", "Barrio Teresa Vial"]}, {"nombre": "Aniuska Castillo", "correo": "aniuska.castillo@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Mirador Capital", "Carrera Capital", "Florida Capital", "Serrano Capital", "Vespucio Capital", "Vicuña Capital", "Zañartu Capital"]}, {"nombre": "Anthoyne González", "correo": "anthoyne.gonzalez@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Pio X", "Vicuña Urban", "Torres de Vicuña Mackenna", "Factoria Italia", "Lofty", "Alférez Real", "Augusto Leguia", "Exequiel Fernandez", "Garden La Cisterna", "Guillermo Mann B", "Guillermo Mann C", "Midtown Santiago", "Stage San Diego"]}, {"nombre": "Ariyari Chacín", "correo": "ariyari.chacin@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Edificio Colón", "Nueva Independencia", "Edificio Santa Rosa", "Su Independencia", "Espacio Oriente", "Nuevo Oriente I", "Nuevo Oriente II"]}, {"nombre": "Jermayn Goncalves", "correo": "jermayn.goncalves@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Amengual", "Conecta Despouy", "Edificio San Carlos", "Antonia", "Alvarez Toledo", "Santo Domingo", "Carnot", "Guardiamarina", "Toledo Rent", "Borgetto"]}, {"nombre": "Joel Zavarce", "correo": "joel.zavarce@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Activa Juan Mitjans", "Pedro de Valdivia", "Concon", "Plaza Conde del Maule", "Las Verbenas", "Cinco de Abril", "MAT", "Placilla", "Sazié", "Vista Parque"]}, {"nombre": "Kandy Mata", "correo": "kandy.mata@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Alameda Park", "Activa Bezanilla", "Activa Cerro Blanco", "Activa Vicuña Mackenna", "Alto Conde", "Edificio San Luis", "Vive Independencia", "Plaza Central", "Mirador Azul"]}, {"nombre": "Maria Victoria Montiel", "correo": "maria.montiel@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Alma Hipodromo", "Mirador José Ureta", "Mirador Gamero", "Echaurren", "Edificio Altavista", "FAM Huemul", "Romero"]}, {"nombre": "Marian Villarroel", "correo": "mariam.villarroel@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["San Isidro 543", "Era", "Home Inclusive Carmen", "Home Inclusive Ecuador", "Home Inclusive Ejército", "Home Inclusive Independencia", "Home Inclusive Manuel Rodriguez", "Urbana 30", "Urbana 35", "Edificio Santiago"]}, {"nombre": "Sergio Maldonado", "correo": "sergio.maldonado@assetplan.cl", "cargo": "Jefe de Operaciones", "permiso": "Agente", "role": "jop", "area": "", "edificios": ["Morande Sur", "Vive Santa Isabel", "Vista San Martín", "Bélgica", "Lia Aguirre", "Santa Elvira", "Morande Norte"]}, {"nombre": "Arisleida Amaro", "correo": "arisleida.amaro@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Camila Fierro", "correo": "camila.fierro@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Lorraine Gonzalez", "correo": "lorraine.gonzalez@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Rossan Saavedra", "correo": "rossana.saavedra@assetplan.cl", "cargo": "Coordinador Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Valeria Valdes", "correo": "valeria.valdes@assetplan.cl", "cargo": "Coordinador Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Yurli Carrillo", "correo": "yurli.carrillo@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Daymar Pino", "correo": "daymar.pino@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Nathalie Rotver", "correo": "nathalie.rotver@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Quenia Godoy", "correo": "quenia.godoy@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Valeska Valenzuela", "correo": "valeska.valenzuela@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Sergio Carmona", "correo": "sergio.carmona@assetplan.cl", "cargo": "Ejecutivo Cobranza Terreno", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Jose Carreño", "correo": "jose.carreno@assetplan.cl", "cargo": "Ejecutivo Cobranza Terreno", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Patricio Cassone", "correo": "patricio.cassone@assetplan.cl", "cargo": "Ejecutivo Cobranza Terreno", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Sergio Fuentes", "correo": "sergio.fuentes@assetplan.cl", "cargo": "Ejecutivo Cobranza Terreno", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Rodolfo Luz", "correo": "rodolfo.luz@assetplan.cl", "cargo": "Ejecutivo Cobranza Terreno", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Massiel Martinez", "correo": "massiel.martinez@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Raul Martinez", "correo": "raul.martinez@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Juan Mendoza", "correo": "juan.mendoza@assetplan.cl", "cargo": "Ejecutivo Cobranza Terreno", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Andrea Morales", "correo": "andrea.morales@assetplan.cl", "cargo": "Abogado de Cobranzas", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Christian Muñoz", "correo": "christian.munoz@assetplan.cl", "cargo": "Ejecutivo Cobranza Terreno", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Carla Orellana", "correo": "carla.orellana@assetplan.cl", "cargo": "Abogado de Gestión de Cobranzas", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Karina Perez", "correo": "karina.perez@assetplan.cl", "cargo": "Subgerente de Cobranzas", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Maria Isabel Perez", "correo": "isabel.perez@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Juan Pinzon", "correo": "juan.pinzon@assetplan.cl", "cargo": "Ejecutivo Cobranza", "permiso": "Solicitante", "role": "solicitante", "area": "Cobranzas", "edificios": []}, {"nombre": "Antonia Iñiguez", "correo": "antonia.iniguez@assetplan.cl", "cargo": "Portfolio Manager Multifamily", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Bastian Iratchet", "correo": "bastian.iratchet@assetplan.cl", "cargo": "Portfolio Manager Multifamily", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Dolores Amunategui", "correo": "dolores.amunategui@assetplan.cl", "cargo": "Asset Manager MF", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Eduardo Celedón", "correo": "eduardo.celedon@assetplan.cl", "cargo": "Portfolio Manager Multifamily", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Mara Bouteille", "correo": "mara.bouteille@assetplan.cl", "cargo": "Portfolio Manager Multifamily", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "María Izquierdo", "correo": "maria.izquierdo@assetplan.cl", "cargo": "Portfolio Manager Multifamily", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Matias D'Alencon", "correo": "matias.dalencon@assetplan.cl", "cargo": "Líder Inteligencia de Negocios MF", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Yasmín Urra", "correo": "yasmin.urra@assetplan.cl", "cargo": "Ejecutiva de gestión Multifamily", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Clemente Errázuriz", "correo": "clemente.errazuriz@assetplan.cl", "cargo": "Gerente Asset Management MF", "permiso": "Solicitante", "role": "solicitante", "area": "Asset Management MF", "edificios": []}, {"nombre": "Constanza Cisternas", "correo": "constanza.cisternas@assetplan.cl", "cargo": "Analista de Gestión Personas", "permiso": "Solicitante", "role": "solicitante", "area": "Gestión de Personas", "edificios": []}, {"nombre": "Naylee Morán", "correo": "naylee.moran@assetplan.cl", "cargo": "Analista Gestión Personas Senior", "permiso": "Solicitante", "role": "solicitante", "area": "Gestión de Personas", "edificios": []}, {"nombre": "Laura Orellana", "correo": "laura.orellana@assetplan.cl", "cargo": "Analista de Gestión Personas", "permiso": "Solicitante", "role": "solicitante", "area": "Gestión de Personas", "edificios": []}, {"nombre": "Daniela Osores", "correo": "daniela.osores@assetplan.cl", "cargo": "Subgerente Gestión Personas", "permiso": "Solicitante", "role": "solicitante", "area": "Gestión de Personas", "edificios": []}, {"nombre": "Jhonathan Rocha", "correo": "jhonattan.rocha@assetplan.cl", "cargo": "Especialista Gestión Personas", "permiso": "Solicitante", "role": "solicitante", "area": "Gestión de Personas", "edificios": []}, {"nombre": "Alex Rojas", "correo": "alex.rojas@assetplan.cl", "cargo": "Analista de Gestión Personas", "permiso": "Solicitante", "role": "solicitante", "area": "Gestión de Personas", "edificios": []}, {"nombre": "Romina Salamanca", "correo": "romina.salamanca@assetplan.cl", "cargo": "Analista Gestión Personas Senior", "permiso": "Solicitante", "role": "solicitante", "area": "Gestión de Personas", "edificios": []}, {"nombre": "Atilio Rios", "correo": "alamedapark@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Alameda Park"]}, {"nombre": "Bruno Garcia", "correo": "almahipodromo@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Alma Hipodromo"]}, {"nombre": "Maria Gabriela Mercado", "correo": "amengual@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Amengual"]}, {"nombre": "Daniela Flores", "correo": "piox@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Pio X"]}, {"nombre": "Edgar Marin", "correo": "despouy@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Conecta Despouy"]}, {"nombre": "Diego Del Re", "correo": "joseureta@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Mirador José Ureta"]}, {"nombre": "Jorge Garces", "correo": "sancarlos@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Edificio San Carlos"]}, {"nombre": "Yoleida Jervis", "correo": "mitjans@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Activa Juan Mitjans"]}, {"nombre": "Wendy Gaita", "correo": "vicunaurban@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Vicuña Urban"]}, {"nombre": "Jose Santamaria", "correo": "antonia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Antonia"]}, {"nombre": "Greily peraza", "correo": "matucana@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Matucana"]}, {"nombre": "Laura Fernandez", "correo": "pedrodevaldivia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Pedro de Valdivia"]}, {"nombre": "Dayana Conde", "correo": "tvm@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Torres de Vicuña Mackenna"]}, {"nombre": "Carifer Moya", "correo": "alvarezdetoledo@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Alvarez Toledo"]}, {"nombre": "Alexis Medina", "correo": "factoriaitalia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Factoria Italia"]}, {"nombre": "José Martínez", "correo": "gamero@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Mirador Gamero"]}, {"nombre": "Genesis lopez", "correo": "miradorcapital@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Mirador Capital"]}, {"nombre": "Lizette Flores", "correo": "santodomingo@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Santo Domingo"]}, {"nombre": "Andrea Melandri", "correo": "concon@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Concon"]}, {"nombre": "Marinella Marinacci", "correo": "condedelmaule@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Plaza Conde del Maule"]}, {"nombre": "Miguel Párraga", "correo": "fraycamilo@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Portugal"]}, {"nombre": "Maria jose", "correo": "echaurren@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Echaurren"]}, {"nombre": "Luis Gutierrez", "correo": "lasverbenas@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Las Verbenas"]}, {"nombre": "Loraine Mosquera Hamburger", "correo": "lofty@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Lofty"]}, {"nombre": "Viviana Muñoz", "correo": "activabezanilla@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Activa Bezanilla"]}, {"nombre": "Eduardo Villota", "correo": "activacerroblanco@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Activa Cerro Blanco"]}, {"nombre": "Carlos Gonzalez", "correo": "activavicuna@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Activa Vicuña Mackenna"]}, {"nombre": "Liseth Garcia", "correo": "alferezreal@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Alférez Real"]}, {"nombre": "Huilfer Martinez Romero", "correo": "altoconde@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Alto Conde"]}, {"nombre": "Yael García", "correo": "augustoleguia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Augusto Leguia"]}, {"nombre": "Fabian Pignone", "correo": "carnot@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Carnot"]}, {"nombre": "Jaclyn Sánchez", "correo": "carreracapital@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Carrera Capital"]}, {"nombre": "Benjamín Sepúlveda Rojas", "correo": "casaelroble@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Casa el Roble"]}, {"nombre": "Mario Ruffo", "correo": "claudiogay@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Claudio Gay"]}, {"nombre": "Natassha Gutierrez", "correo": "isabelriquelme@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Edificio Altavista"]}, {"nombre": "Victor Albarracin", "correo": "cincodeabril@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Cinco de Abril"]}, {"nombre": "Luisa Díaz Mora", "correo": "colon@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Edificio Colón"]}, {"nombre": "Juan Camilo Perez", "correo": "nuevaindependencia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Nueva Independencia"]}, {"nombre": "Isabella Mellado", "correo": "parquebrasil@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Parque Brasil"]}, {"nombre": "Anais Valle Montero", "correo": "fagnano@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["San Isidro 543"]}, {"nombre": "Freddy Araujo", "correo": "sanluisbtg@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Edificio San Luis"]}, {"nombre": "Luis Chauran", "correo": "santarosa@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Edificio Santa Rosa"]}, {"nombre": "Luis Jiménez", "correo": "suindependencia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Su Independencia"]}, {"nombre": "Jean Paul Urra", "correo": "viveindependencia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Vive Independencia"]}, {"nombre": "Angel Figuera", "correo": "sanluis@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Era"]}, {"nombre": "Christian Reyes", "correo": "espacioriente@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Espacio Oriente"]}, {"nombre": "Jessica Polanco", "correo": "exequielfernandez@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Exequiel Fernandez"]}, {"nombre": "Jessie Fabiana Guilarte Hurtado", "correo": "huemul@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["FAM Huemul"]}, {"nombre": "Briseyda Marval", "correo": "floridacapital@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Florida Capital"]}, {"nombre": "Yerisay Hernández", "correo": "garden@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Garden La Cisterna"]}, {"nombre": "Keyla Jiménez", "correo": "guardiamarina@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Guardiamarina"]}, {"nombre": "Dariesel Urdaneta", "correo": "guillermomann@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Guillermo Mann B", "Guillermo Mann C"]}, {"nombre": "Ayleen Letelier", "correo": "carmen@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Home Inclusive Carmen"]}, {"nombre": "Ignacio Jimenez", "correo": "ecuador@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Home Inclusive Ecuador"]}, {"nombre": "Uri Polanco", "correo": "ejercito@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Home Inclusive Ejército"]}, {"nombre": "Julio Gonzalez", "correo": "independencia@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Home Inclusive Independencia"]}, {"nombre": "Ruben Barrios", "correo": "manuelrodriguez@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Home Inclusive Manuel Rodriguez"]}, {"nombre": "Maria Fernanda Tovar", "correo": "lazo@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Lazo"]}, {"nombre": "Jose Ignacio Lazo", "correo": "tocornal@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["MAT"]}, {"nombre": "Albert Borges", "correo": "midtown@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Midtown Santiago"]}, {"nombre": "Andrea Grau", "correo": "morande@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Morande Sur"]}, {"nombre": "Angel Marquez", "correo": "nuevavaldes@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Nueva Valdés"]}, {"nombre": "Arianni Rodríguez Arrieta", "correo": "nuevoriente@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Nuevo Oriente I", "Nuevo Oriente II"]}, {"nombre": "Marcos Bracho", "correo": "placilla@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Placilla"]}, {"nombre": "Jorge Vaquero", "correo": "plazacentral@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Plaza Central"]}, {"nombre": "Richard Marquez", "correo": "romero@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Romero"]}, {"nombre": "Krysthoferd Molero", "correo": "sazie@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Sazié"]}, {"nombre": "Sidi Carrasco", "correo": "serranocapital@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Serrano Capital"]}, {"nombre": "Maryoris Narvaez", "correo": "stage@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Stage San Diego"]}, {"nombre": "Joseph Gonzalez", "correo": "toledorent@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Toledo Rent"]}, {"nombre": "Angel Ricardo", "correo": "urbana@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Urbana 30", "Urbana 35"]}, {"nombre": "Albany Perez", "correo": "vespuciocapital@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Vespucio Capital"]}, {"nombre": "Luis Manuel Bolívar Venegas", "correo": "vicunacapital@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Vicuña Capital"]}, {"nombre": "Adriana Trocelis", "correo": "vistaparque@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Vista Parque"]}, {"nombre": "Oscar Dias", "correo": "vivesantaisabel@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Vive Santa Isabel"]}, {"nombre": "Maria Macuart", "correo": "zanartucapital@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Zañartu Capital"]}, {"nombre": "Lorena Rojas", "correo": "borgetto@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Borgetto"]}, {"nombre": "Cosme Nieves", "correo": "miradorazul@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Mirador Azul"]}, {"nombre": "Hector Uzcategui", "correo": "maestragabriela@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Maestra Gabriela"]}, {"nombre": "Barrio Juan de Pineda", "correo": "juandepineda@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Barrio Juan de Pineda"]}, {"nombre": "Barrio Teresa Vial", "correo": "teresavial@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Barrio Teresa Vial"]}, {"nombre": "Edificio Santiago", "correo": "santiago1221@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Edificio Santiago"]}, {"nombre": "Vista San Martín", "correo": "sanmartin@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Vista San Martín"]}, {"nombre": "Rosalia Rojas", "correo": "plazachacabuco@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Activa Plaza Chacabuco"]}, {"nombre": "Vanesa Achique", "correo": "belgica@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Bélgica"]}, {"nombre": "Ramon Sanchez", "correo": "activadominica@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Activa Dominica"]}, {"nombre": "Carmen España", "correo": "yazigi@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Conquista Yazigi"]}, {"nombre": "Oscar Dias", "correo": "lia.aguirre@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Lia Aguirre"]}, {"nombre": "Miguel Quintero", "correo": "miradorcasona@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Mirador Casona"]}, {"nombre": "Pedro Garcia", "correo": "santaelvira@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Santa Elvira"]}, {"nombre": "Roberto Cárcamo", "correo": "morandenorte@apcomunidades.cl", "cargo": "Jefe de Edificio", "permiso": "Agente", "role": "jem", "area": "", "edificios": ["Morande Norte"]}], "estados": ["Nuevo", "Asignado", "En gestión", "En espera", "Pendiente", "Resuelto", "Cerrado", "Reabierto"]};

/* ===== Tokens Assetplan ===== */
const AZUL = "#1D57D2", TINTA = "#0F2E6B", CELESTE = "#E1EFFE", CELBG = "#F4F8FF";
const TEXT = "#122036", MUT = "#5B6B85", LINE = "#E4EAF1";

const PRIO = {
  Urgente: { bg: "#FEE2E2", fg: "#B91C1C", dot: "#DC2626" },
  Alta:    { bg: "#FFEDD5", fg: "#C2410C", dot: "#EA580C" },
  Media:   { bg: CELESTE,   fg: TINTA,    dot: AZUL },
  Baja:    { bg: "#EEF2F6", fg: "#475569", dot: "#94A3B8" },
};
const OPEN_STATES = ["Nuevo", "Asignado", "En gestión", "En espera", "Pendiente", "Reabierto"];
const DONE_STATES = ["Resuelto", "Cerrado"];
const STATE_COLOR = {
  "Nuevo": "#1D57D2", "Asignado": "#6D28D9", "En gestión": "#0891B2",
  "En espera": "#B45309", "Pendiente": "#B45309", "Reabierto": "#BE123C",
  "Resuelto": "#15803D", "Cerrado": "#64748B",
};

/* ===== Helpers ===== */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const pad=n=>String(n).padStart(2,"0");
const MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fdate(ms){const d=new Date(ms);return `${d.getDate()} ${MES[d.getMonth()]}`;}
function ftime(ms){const d=new Date(ms);return `${pad(d.getHours())}:${pad(d.getMinutes())}`;}
function fdt(ms){return `${fdate(ms)} · ${ftime(ms)}`;}
function initials(n){return n.split(" ").filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase();}
function avatarColor(n){let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))>>>0;const hue=h%360;return `hsl(${hue} 45% 42%)`;}

function slaInfo(t, now){
  if(DONE_STATES.includes(t.estado)) return {k:"resuelto", label:"Resuelto", bg:"#EEF2F6", fg:"#64748B"};
  const rem = t.dueAt - now;
  const h = rem/3600000;
  if(rem < 0){const days=Math.max(1,Math.ceil(-rem/86400000));return {k:"vencido", label:`Vencido: ${days} d`, bg:"#FEE2E2", fg:"#B91C1C"};}
  if(h <= 24){const hh=Math.max(1,Math.ceil(h));return {k:"pronto", label:`Vence en ${hh} h`, bg:"#FEF3C7", fg:"#B45309"};}
  const days=Math.ceil(h/24);return {k:"ok", label:`${days} d restantes`, bg:"#ECFDF5", fg:"#15803D"};
}

/* ===== Seed de tickets ===== */
const ASUNTOS = {
  "Gestión de Cobranza":["Gestión de cobranza depto {n}","Convenio de pago depto {n}","Solicito descerraje unidad {n}"],
  "Mantención y Reparaciones":["Filtración en depto {n}","Ascensor detenido","Falla en bomba de agua","Reparación de portón de acceso"],
  "Atención al Cliente":["Reclamo de arrendatario depto {n}","Consulta postventa depto {n}","Cliente molesto en recepción"],
  "Reclamos Prioritarios":["Reclamo SERNAC ingresado","Publicación negativa en RRSS","Caso Reclamos.cl abierto"],
  "Seguridad y Prevención":["Simulacro de evacuación pendiente","Incidente de seguridad en acceso","Certificación de ascensores"],
  "Legal y Contratos":["Revisión de contrato de arriendo","Requerimiento legal arrendatario","Término anticipado depto {n}"],
  "Comunicación Interna":["Bajada de información al equipo","Instructivo nuevo protocolo"],
  "Administración y Personas":["Aprobación de propietario pendiente","Compra de insumos de aseo","Reposición de luminarias"],
  "Comercial y Arriendo":["Cupón de descuento depto {n}","Rotación de unidad {n}","Consulta de demand del edificio"],
  "Gestión de Rotaciones":["Emisión de salvoconducto depto {n}","Check out depto {n}"],
  "Seguros":["Siniestro por filtración depto {n}"],
  "Personas":["Requerimiento de RRHH","Solicitud de reemplazo de turno"],
  "Sistemas Visitas y Encomiendas":["Registro de encomienda depto {n}","Autorización de visita depto {n}"],
};
const DESC = {
  "Gestión de Cobranza":"El arrendatario mantiene deuda pendiente. Se solicita gestión y coordinación de pago según protocolo.",
  "Mantención y Reparaciones":"Se reporta una falla que requiere atención de mantención. Adjuntar registro fotográfico y coordinar visita técnica.",
  "Atención al Cliente":"El arrendatario manifiesta una molestia que requiere respuesta. Contactar y registrar la gestión.",
  "Reclamos Prioritarios":"Reclamo prioritario que debe responderse dentro del plazo comprometido para evitar escalamiento.",
  "Seguridad y Prevención":"Requerimiento de seguridad y prevención de riesgos que debe gestionarse con el equipo del edificio.",
  "Legal y Contratos":"Se solicita revisión legal / contractual del caso indicado. Adjuntar documentación de respaldo.",
  "Comunicación Interna":"Se debe bajar la información al equipo y confirmar recepción.",
  "Administración y Personas":"Gestión administrativa pendiente de aprobación / compra según corresponda.",
  "Comercial y Arriendo":"Gestión comercial del edificio pendiente de resolución.",
  "Gestión de Rotaciones":"Trámite de rotación de unidad. Emitir documento y registrar en el sistema.",
  "Seguros":"Siniestro reportado. Iniciar gestión con la compañía de seguros.",
  "Personas":"Requerimiento de gestión de personas del edificio.",
  "Sistemas Visitas y Encomiendas":"Registro de visita / encomienda en el sistema del edificio.",
};

function seedTickets(){
  const rng = mulberry32(20260915);
  const cats = DATA.cats, builds = DATA.buildings;
  const sols = DATA.users.filter(u=>u.role==="solicitante");
  const now = Date.now();
  const stateBag = ["Nuevo","Asignado","Asignado","En gestión","En gestión","En gestión","En espera","Pendiente","Resuelto","Resuelto","Cerrado"];
  const out=[];
  const N=52;
  for(let i=0;i<N;i++){
    const b = builds[Math.floor(rng()*builds.length)];
    const c = cats[Math.floor(rng()*cats.length)];
    const sol = sols[Math.floor(rng()*sols.length)];
    const isJop = c.rol==="JOP";
    const respName = isJop ? b.jop : b.jem;
    const respMail = isJop ? b.jopCorreo : b.jemCorreo;
    const estado = stateBag[Math.floor(rng()*stateBag.length)];
    const horas = c.horas || 4;
    const ageH = rng()* (horas*2.2);
    const createdAt = now - ageH*3600000;
    const dueAt = createdAt + horas*3600000;
    const unit = 100 + Math.floor(rng()*900);
    const tpl = (ASUNTOS[c.categoria]||["Solicitud"])[Math.floor(rng()*(ASUNTOS[c.categoria]||[1]).length)];
    const asunto = tpl.replace("{n}", unit);
    const folio = 874000 + i*7 + Math.floor(rng()*6);

    // historial
    const hist=[{t:createdAt, who:sol.nombre, kind:"crea", action:"creó el ticket", text:(DESC[c.categoria]||"")}];
    hist.push({t:createdAt+9*60000, who:"NEXO", kind:"sys", action:`asignó el ticket a ${respName}`});
    const idx = stateBag.indexOf(estado);
    if(["En gestión","En espera","Pendiente","Resuelto","Cerrado"].includes(estado)){
      hist.push({t:createdAt+40*60000, who:respName, kind:"coment", action:"agregó un comentario", text:"Tomo el caso y coordino la gestión con el equipo del edificio."});
      hist.push({t:createdAt+55*60000, who:respName, kind:"estado", action:'cambió el estado a "En gestión"'});
    }
    if(estado==="En espera") hist.push({t:createdAt+3*3600000, who:respName, kind:"estado", action:'cambió el estado a "En espera" (información interna)'});
    if(estado==="Pendiente") hist.push({t:createdAt+3*3600000, who:respName, kind:"estado", action:'cambió el estado a "Pendiente" (espera respuesta del solicitante)'});
    let csat=null;
    if(DONE_STATES.includes(estado)){
      hist.push({t:dueAt-1*3600000, who:respName, kind:"coment", action:"agregó un comentario", text:"Gestión realizada y validada. Cierro el ticket."});
      hist.push({t:dueAt-30*60000, who:respName, kind:"estado", action:`cambió el estado a "${estado}"`});
      if(rng()>0.25){csat = rng()>0.35?5:(rng()>0.4?4:3); hist.push({t:dueAt-10*60000, who:sol.nombre, kind:"csat", action:`evaluó la atención: ${csat}/5`});}
    }
    out.push({
      id:`#${folio}`, folio, asunto, edificio:b.nombre, comuna:b.comuna,
      categoria:c.categoria, subcategoria:c.subcategoria, prioridad:c.prioridad,
      responsable:respName, responsableCorreo:respMail, responsableRol:c.rol,
      solicitante:sol.nombre, solicitanteCorreo:sol.correo, area:sol.area||"Operaciones",
      estado, createdAt, dueAt, csat, unit,
      descripcion:(DESC[c.categoria]||""),
      history:hist.sort((a,b)=>a.t-b.t),
    });
  }
  return out.sort((a,b)=>b.createdAt-a.createdAt);
}

/* ===== Scoping por rol ===== */
function visibleTickets(user, tickets){
  if(!user) return [];
  if(user.role==="dueno"||user.role==="admin") return tickets;
  if(user.role==="solicitante") return tickets.filter(t=>t.solicitanteCorreo===user.correo);
  const set = new Set(user.edificios||[]);
  return tickets.filter(t=> set.has(t.edificio) || t.responsableCorreo===user.correo);
}

/* ================= UI ================= */
function Avatar({name, size=36}){
  return <div style={{width:size,height:size,background:avatarColor(name),fontSize:size*0.36}}
    className="rounded-full text-white font-bold flex items-center justify-center shrink-0">{initials(name)}</div>;
}
function Chip({children, bg, fg, dot}){
  return <span style={{background:bg,color:fg}} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
    {dot && <span style={{background:dot}} className="w-1.5 h-1.5 rounded-full"/>}{children}</span>;
}
function PrioChip({p}){const c=PRIO[p]||PRIO.Media;return <Chip bg={c.bg} fg={c.fg} dot={c.dot}>{p}</Chip>;}
function StateChip({s}){const col=STATE_COLOR[s]||MUT;return <Chip bg={col+"1A"} fg={col}>{s}</Chip>;}
function SlaChip({t,now}){const s=slaInfo(t,now);return <Chip bg={s.bg} fg={s.fg} dot={s.k==="vencido"?s.fg:undefined}>{s.k==="vencido"&&"● "}{s.label}</Chip>;}

/* ---- Pantalla Bienvenida ---- */
function Welcome({onEnter}){
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{background:`radial-gradient(1200px 600px at 70% -10%, #2E6BE6 0%, ${AZUL} 40%, ${TINTA} 100%)`}}>
      <div className="absolute inset-0 opacity-[0.14]" style={{backgroundImage:"radial-gradient(#fff 1px, transparent 1px)",backgroundSize:"26px 26px"}}/>
      <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full" style={{background:"#4E86F71f",filter:"blur(10px)"}}/>
      <div className="relative text-center px-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="grid grid-cols-2 gap-1.5">
            <span className="w-3.5 h-3.5 rounded-[3px]" style={{background:"#fff"}}/>
            <span className="w-3.5 h-3.5 rounded-[3px]" style={{background:CELESTE}}/>
            <span className="w-3.5 h-3.5 rounded-[3px]" style={{background:CELESTE}}/>
            <span className="w-3.5 h-3.5 rounded-[3px]" style={{background:"#fff"}}/>
          </div>
        </div>
        <h1 className="text-white font-extrabold tracking-tight" style={{fontSize:"clamp(3.4rem,12vw,7rem)",letterSpacing:"-0.04em",lineHeight:1}}>NEXO</h1>
        <p className="mt-3 text-white/90 font-semibold" style={{fontSize:"clamp(1.05rem,3vw,1.5rem)"}}>Menos vueltas. Más soluciones.</p>
        <button onClick={onEnter}
          className="mt-10 inline-flex items-center gap-2 bg-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow active:scale-[.99]"
          style={{color:AZUL}}>
          INGRESA AQUÍ
        </button>
        <div className="mt-14 text-white/70 text-sm">Proyectos — Dayana Figueroa</div>
      </div>
    </div>
  );
}

/* ---- Login ---- */
function Login({onLogin, onBack}){
  const [email,setEmail]=useState("");
  const [err,setErr]=useState("");
  const [stage,setStage]=useState(0);
  const users = DATA.users;
  const tryLogin=(e)=>{
    const correo=(e||email).trim().toLowerCase();
    const u=users.find(x=>x.correo===correo);
    if(!u){setErr("Este correo no está autorizado en NEXO. Verifica con el administrador.");return;}
    onLogin(u);
  };
  const examples=[
    {l:"Dueño",e:"dayana.figueroa@assetplan.cl"},
    {l:"Administrador",e:"gonzalo.cabezas@assetplan.cl"},
    {l:"JOP",e:"kandy.mata@assetplan.cl"},
    {l:"JEM",e:"alferezreal@apcomunidades.cl"},
    {l:"Solicitante",e:"arisleida.amaro@assetplan.cl"},
  ];
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:CELBG}}>
      <div className="w-full max-w-md">
        <button onClick={onBack} className="text-sm mb-4 inline-flex items-center gap-1" style={{color:MUT}}><ArrowLeft size={15}/>Volver</button>
        <div className="bg-white rounded-2xl border p-8 shadow-sm" style={{borderColor:LINE}}>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="font-extrabold text-2xl tracking-tight" style={{color:AZUL,letterSpacing:"-0.03em"}}>NEXO</span>
          </div>
          <p className="text-sm mb-6" style={{color:MUT}}>Ingresa con tu cuenta corporativa. El sistema reconoce tu rol y tus edificios automáticamente.</p>

          <button onClick={()=>setStage(1)}
            className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 font-semibold hover:bg-slate-50 transition-colors"
            style={{borderColor:LINE,color:TEXT}}>
            <GoogleG/> Continuar con Google
          </button>

          {stage===1 && (
            <div className="mt-5">
              <label className="text-xs font-semibold" style={{color:MUT}}>Correo corporativo</label>
              <input autoFocus value={email} onChange={e=>{setEmail(e.target.value);setErr("");}}
                onKeyDown={e=>e.key==="Enter"&&tryLogin()}
                placeholder="nombre@assetplan.cl"
                className="mt-1 w-full border rounded-xl px-3.5 py-2.5 outline-none focus:ring-2"
                style={{borderColor:err?"#FCA5A5":LINE, boxShadow:"none"}}/>
              {err && <p className="text-xs mt-2" style={{color:"#B91C1C"}}>{err}</p>}
              <button onClick={()=>tryLogin()} className="mt-3 w-full rounded-xl py-2.5 font-bold text-white" style={{background:AZUL}}>Ingresar</button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t" style={{borderColor:LINE}}>
            <p className="text-xs font-semibold mb-2" style={{color:MUT}}>Prueba rápida por rol</p>
            <div className="flex flex-wrap gap-1.5">
              {examples.map(x=>(
                <button key={x.e} onClick={()=>{setStage(1);setEmail(x.e);setErr("");tryLogin(x.e);}}
                  className="text-xs px-2.5 py-1 rounded-lg border font-medium hover:bg-slate-50"
                  style={{borderColor:LINE,color:TEXT}}>{x.l}</button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs mt-4" style={{color:MUT}}>Prototipo · autenticación simulada contra la lista de usuarios</p>
      </div>
    </div>
  );
}
function GoogleG(){return(
  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.6 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.1-3.8 6.5-9.4 6.5-16z"/><path fill="#FBBC05" d="M10.3 28.4c-.5-1.5-.8-3.1-.8-4.4s.3-3 .8-4.4l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.5l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.1-5.5c-2 1.3-4.6 2.1-8.2 2.1-6.4 0-11.8-4.1-13.7-9.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/></svg>
);}

/* ---- Sidebar ---- */
function Sidebar({user, nav, setNav, onLogout}){
  const items=[];
  if(user.role==="solicitante"){
    items.push({k:"mis", label:"Mis solicitudes", icon:Inbox});
  } else {
    items.push({k:"soporte", label:"Soporte", icon:Inbox});
    items.push({k:"dash", label:"Dashboard", icon:LayoutDashboard});
    items.push({k:"reportes", label:"Reportes", icon:BarChart3});
  }
  if(user.role==="dueno") items.push({k:"admin", label:"Centro de Administración", icon:Settings});
  const roleLabel={dueno:"Dueño",admin:"Administrador",jop:"Jefe de Operaciones",jem:"Jefe de Edificio",solicitante:"Solicitante"}[user.role];
  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col text-white" style={{background:TINTA}}>
      <div className="px-5 pt-5 pb-4 flex items-center gap-2">
        <div className="grid grid-cols-2 gap-1">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-white"/><span className="w-2.5 h-2.5 rounded-[2px]" style={{background:CELESTE}}/>
          <span className="w-2.5 h-2.5 rounded-[2px]" style={{background:CELESTE}}/><span className="w-2.5 h-2.5 rounded-[2px] bg-white"/>
        </div>
        <span className="font-extrabold text-xl tracking-tight">NEXO</span>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {items.map(it=>{const A=it.icon;const on=nav===it.k;return(
          <button key={it.k} onClick={()=>setNav(it.k)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{background:on?"#ffffff18":"transparent",color:on?"#fff":"#C6D4EE"}}>
            <A size={18}/>{it.label}
          </button>);})}
      </nav>
      <div className="p-3 border-t" style={{borderColor:"#ffffff1f"}}>
        <div className="flex items-center gap-2.5 px-1 py-1">
          <Avatar name={user.nombre} size={34}/>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user.nombre}</div>
            <div className="text-[11px] truncate" style={{color:"#9DB4DE"}}>{roleLabel}</div>
          </div>
        </div>
        <button onClick={onLogout} className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{color:"#C6D4EE"}}>
          <LogOut size={16}/>Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

/* ---- Topbar ---- */
function Topbar({title, subtitle, onNew, search, setSearch}){
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b px-6 py-3 flex items-center gap-4" style={{borderColor:LINE}}>
      <div className="min-w-0">
        <h1 className="text-lg font-bold leading-tight truncate" style={{color:TEXT}}>{title}</h1>
        {subtitle && <p className="text-xs truncate" style={{color:MUT}}>{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 border rounded-lg px-2.5 py-1.5" style={{borderColor:LINE}}>
          <Search size={15} style={{color:MUT}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ticket, edificio…"
            className="outline-none text-sm w-44" />
        </div>
        <button className="p-2 rounded-lg border" style={{borderColor:LINE,color:MUT}}><Bell size={17}/></button>
        <button onClick={onNew} className="inline-flex items-center gap-1.5 text-white font-semibold text-sm px-3.5 py-2 rounded-lg" style={{background:AZUL}}>
          <Plus size={16}/>Crear ticket
        </button>
      </div>
    </header>
  );
}

/* ---- KPI cards ---- */
function Kpi({label, value, tone}){
  const tones={azul:{bg:CELBG,fg:AZUL},rojo:{bg:"#FEF2F2",fg:"#DC2626"},verde:{bg:"#F0FDF4",fg:"#15803D"},amar:{bg:"#FFFBEB",fg:"#B45309"},gris:{bg:"#F8FAFC",fg:TEXT}};
  const c=tones[tone]||tones.gris;
  return <div className="rounded-xl border p-4" style={{borderColor:LINE,background:c.bg}}>
    <div className="text-[11px] font-semibold uppercase tracking-wide" style={{color:MUT}}>{label}</div>
    <div className="text-2xl font-extrabold mt-1" style={{color:c.fg}}>{value}</div>
  </div>;
}
function Dashboard({tickets, user, now, onOpen}){
  const abiertos=tickets.filter(t=>OPEN_STATES.includes(t.estado)).length;
  const pendientes=tickets.filter(t=>t.estado==="Pendiente").length;
  const espera=tickets.filter(t=>t.estado==="En espera").length;
  const resueltos=tickets.filter(t=>DONE_STATES.includes(t.estado)).length;
  const fuera=tickets.filter(t=>OPEN_STATES.includes(t.estado)&&t.dueAt<now).length;
  const done=tickets.filter(t=>DONE_STATES.includes(t.estado));
  const slaReal= done.length? Math.round(100*done.filter(t=>{const r=t.history.find(h=>/cambió el estado a "(Resuelto|Cerrado)"/.test(h.action));return r? r.t<=t.dueAt: true;}).length/done.length):100;
  const csats=tickets.filter(t=>t.csat).map(t=>t.csat);
  const csat= csats.length? (csats.reduce((a,b)=>a+b,0)/csats.length).toFixed(1):"—";
  const recientes=[...tickets].sort((a,b)=>b.createdAt-a.createdAt).slice(0,6);
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <Kpi label="Abiertos" value={abiertos} tone="azul"/>
        <Kpi label="Pendientes" value={pendientes} tone="amar"/>
        <Kpi label="En espera" value={espera} tone="amar"/>
        <Kpi label="Resueltos" value={resueltos} tone="verde"/>
        <Kpi label="Fuera de SLA" value={fuera} tone="rojo"/>
        <Kpi label="SLA %" value={slaReal+"%"} tone="azul"/>
        <Kpi label="CSAT" value={csat} tone="gris"/>
      </div>
      <div className="mt-6">
        <h2 className="text-sm font-bold mb-2" style={{color:TEXT}}>Últimos tickets</h2>
        <div className="rounded-xl border overflow-hidden bg-white" style={{borderColor:LINE}}>
          {recientes.map((t,i)=>(
            <button key={t.id} onClick={()=>onOpen(t.id)} className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50" style={{borderTop:i?`1px solid ${LINE}`:"none"}}>
              <span className="text-xs font-mono font-semibold w-16 shrink-0" style={{color:MUT}}>{t.id}</span>
              <span className="flex-1 text-sm font-medium truncate" style={{color:TEXT}}>{t.asunto}</span>
              <span className="hidden sm:block text-xs w-40 truncate" style={{color:MUT}}>{t.edificio}</span>
              <PrioChip p={t.prioridad}/>
              <SlaChip t={t} now={now}/>
              <StateChip s={t.estado}/>
            </button>
          ))}
          {recientes.length===0 && <div className="px-4 py-8 text-center text-sm" style={{color:MUT}}>Aún no hay tickets para mostrar.</div>}
        </div>
      </div>
    </div>
  );
}

/* ---- Lista de tickets ---- */
function TicketList({tickets, user, now, onOpen, title, subtitle}){
  const [f,setF]=useState({estado:"",prio:"",cat:"",edif:"",sla:""});
  const cats=[...new Set(DATA.cats.map(c=>c.categoria))];
  const edifs = user.role==="jop"||user.role==="jem" ? (user.edificios||[]) : [...new Set(tickets.map(t=>t.edificio))].sort();
  const rows = tickets.filter(t=>{
    if(f.estado && t.estado!==f.estado) return false;
    if(f.prio && t.prioridad!==f.prio) return false;
    if(f.cat && t.categoria!==f.cat) return false;
    if(f.edif && t.edificio!==f.edif) return false;
    if(f.sla){const s=slaInfo(t,now).k; if(f.sla!==s) return false;}
    return true;
  });
  const Sel=({v,set,children,w})=>(
    <div className="relative">
      <select value={v} onChange={e=>set(e.target.value)} className="appearance-none border rounded-lg pl-3 pr-8 py-1.5 text-sm bg-white outline-none" style={{borderColor:LINE,color:TEXT,minWidth:w||120}}>{children}</select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:MUT}}/>
    </div>
  );
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Filter size={15} style={{color:MUT}}/>
        {(user.role==="jop") && (
          <Sel v={f.edif} set={v=>setF({...f,edif:v})} w={150}><option value="">Mis edificios · Todos</option>{edifs.map(e=><option key={e} value={e}>{e}</option>)}</Sel>
        )}
        {(user.role!=="jop"&&user.role!=="jem") && (
          <Sel v={f.edif} set={v=>setF({...f,edif:v})} w={150}><option value="">Edificio · Todos</option>{edifs.map(e=><option key={e} value={e}>{e}</option>)}</Sel>
        )}
        <Sel v={f.estado} set={v=>setF({...f,estado:v})}><option value="">Estado · Todos</option>{DATA.estados.map(e=><option key={e} value={e}>{e}</option>)}</Sel>
        <Sel v={f.prio} set={v=>setF({...f,prio:v})}><option value="">Prioridad</option>{["Urgente","Alta","Media","Baja"].map(e=><option key={e} value={e}>{e}</option>)}</Sel>
        <Sel v={f.cat} set={v=>setF({...f,cat:v})} w={160}><option value="">Categoría</option>{cats.map(e=><option key={e} value={e}>{e}</option>)}</Sel>
        <Sel v={f.sla} set={v=>setF({...f,sla:v})}><option value="">SLA</option><option value="vencido">Vencido</option><option value="pronto">Por vencer</option><option value="ok">En plazo</option><option value="resuelto">Resuelto</option></Sel>
        <span className="text-xs ml-auto" style={{color:MUT}}>{rows.length} tickets</span>
      </div>
      <div className="rounded-xl border overflow-hidden bg-white" style={{borderColor:LINE}}>
        <div className="grid items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide" style={{gridTemplateColumns:"72px 1.6fr 1fr 1fr 92px 130px 110px 70px",color:MUT,background:"#FBFCFE",borderBottom:`1px solid ${LINE}`}}>
          <span>Ticket</span><span>Asunto / Categoría</span><span>Solicitante</span><span>Edificio</span><span>Prioridad</span><span>SLA</span><span>Estado</span><span>Fecha</span>
        </div>
        <div className="max-h-[calc(100vh-230px)] overflow-auto">
        {rows.map((t,i)=>(
          <button key={t.id} onClick={()=>onOpen(t.id)} className="w-full text-left grid items-center gap-2 px-4 py-3 hover:bg-slate-50"
            style={{gridTemplateColumns:"72px 1.6fr 1fr 1fr 92px 130px 110px 70px",borderTop:i?`1px solid ${LINE}`:"none"}}>
            <span className="text-xs font-mono font-semibold" style={{color:AZUL}}>{t.id}</span>
            <span className="min-w-0"><span className="block text-sm font-semibold truncate" style={{color:TEXT}}>{t.asunto}</span><span className="block text-xs truncate" style={{color:MUT}}>{t.categoria} · {t.subcategoria}</span></span>
            <span className="text-sm truncate" style={{color:TEXT}}>{t.solicitante}</span>
            <span className="text-sm truncate" style={{color:MUT}}>{t.edificio}</span>
            <PrioChip p={t.prioridad}/>
            <SlaChip t={t} now={now}/>
            <StateChip s={t.estado}/>
            <span className="text-xs" style={{color:MUT}}>{fdate(t.createdAt)}</span>
          </button>
        ))}
        {rows.length===0 && <div className="px-4 py-12 text-center text-sm" style={{color:MUT}}>No hay tickets con estos filtros. Ajusta los filtros o crea uno nuevo.</div>}
        </div>
      </div>
    </div>
  );
}

/* ---- Vista interna del ticket (estilo Zendesk) ---- */
function TicketDetail({t, user, now, onBack, onUpdate}){
  const [comment,setComment]=useState("");
  const [estado,setEstado]=useState(t.estado);
  const bottomRef=useRef(null);
  useEffect(()=>{setEstado(t.estado);},[t.id]);
  const send=()=>{
    if(!comment.trim() && estado===t.estado) return;
    const events=[...t.history];
    if(comment.trim()) events.push({t:Date.now(),who:user.nombre,kind:"coment",action:"agregó un comentario",text:comment.trim()});
    if(estado!==t.estado) events.push({t:Date.now(),who:user.nombre,kind:"estado",action:`cambió el estado a "${estado}"`});
    onUpdate({...t,estado,history:events});
    setComment("");
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
  };
  const sla=slaInfo(t,now);
  const F=({label,children})=>(
    <div className="mb-3"><div className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{color:MUT}}>{label}</div><div className="text-sm" style={{color:TEXT}}>{children}</div></div>
  );
  return (
    <div className="flex flex-col h-screen">
      {/* barra superior tipo Zendesk */}
      <div className="bg-white border-b px-4 py-2.5 flex items-center gap-3" style={{borderColor:LINE}}>
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100" style={{color:MUT}}><ArrowLeft size={18}/></button>
        <span className="text-sm" style={{color:MUT}}>Assetplan</span><span style={{color:"#CBD5E1"}}>/</span>
        <span className="text-sm font-medium" style={{color:TEXT}}>{t.solicitante}</span>
        <StateChip s={t.estado}/>
        <span className="text-sm font-mono" style={{color:MUT}}>Ticket {t.id}</span>
      </div>

      <div className="flex-1 grid overflow-hidden" style={{gridTemplateColumns:"290px 1fr 280px"}}>
        {/* IZQUIERDA · datos del ticket */}
        <div className="border-r overflow-auto p-5" style={{borderColor:LINE,background:"#FBFCFE"}}>
          <F label="Marca"><div className="inline-flex items-center gap-2 border rounded-lg px-2.5 py-1.5" style={{borderColor:LINE,background:"#fff"}}><span className="w-4 h-4 rounded-sm" style={{background:AZUL}}/>Assetplan</div></F>
          <F label="Responsable asignado"><div className="flex items-center gap-2"><Avatar name={t.responsable} size={26}/><span>{t.responsable}</span></div></F>
          <F label="N° Ticket"><span className="font-mono">{t.id}</span></F>
          <F label="Edificio">{t.edificio} <span style={{color:MUT}}>· {t.comuna}</span></F>
          <F label="Área solicitante">{t.area}</F>
          <F label="Categoría">{t.categoria}</F>
          <F label="Subcategoría">{t.subcategoria}</F>
          <F label="Prioridad"><PrioChip p={t.prioridad}/></F>
          <F label="Fecha de ingreso">{fdt(t.createdAt)}</F>
          <F label="Fecha requerida (SLA)">{fdt(t.dueAt)}</F>
          <F label="SLA"><Chip bg={sla.bg} fg={sla.fg} dot={sla.k==="vencido"?sla.fg:undefined}>{sla.k==="vencido"&&"● "}{sla.label}</Chip></F>
          <F label="Adjuntos"><div className="flex items-center gap-2 text-sm" style={{color:MUT}}><Paperclip size={14}/>2 archivos</div></F>
        </div>

        {/* CENTRO · conversación / historial */}
        <div className="flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b" style={{borderColor:LINE}}>
            <h2 className="text-lg font-bold" style={{color:TEXT}}>{t.asunto}</h2>
            <div className="text-xs mt-0.5 flex items-center gap-2" style={{color:MUT}}>
              <span>A través de formulario web</span><span>·</span><span>{t.categoria}</span><span>·</span>
              <span className="inline-flex items-center gap-1"><Circle size={8} className="fill-current" style={{color:t.prioridad==="Urgente"?"#DC2626":AZUL}}/>{t.prioridad}</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto px-6 py-5 space-y-4" style={{background:CELBG}}>
            {t.history.map((h,i)=>(
              <div key={i} className="flex gap-3">
                {h.kind==="sys" ? <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{background:CELESTE,color:AZUL}}><ShieldCheck size={16}/></div> : <Avatar name={h.who} size={36}/>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{color:TEXT}}>{h.who}</span>
                    <span className="text-xs" style={{color:MUT}}>{h.action}</span>
                    <span className="text-xs" style={{color:"#9AA7BC"}}>· {fdate(h.t)} {ftime(h.t)}</span>
                  </div>
                  {h.text && <div className="mt-1.5 bg-white border rounded-xl px-3.5 py-2.5 text-sm" style={{borderColor:LINE,color:TEXT}}>{h.text}</div>}
                  {h.kind==="csat" && <div className="mt-1.5 inline-flex items-center gap-1">{[1,2,3,4,5].map(n=><Star key={n} size={15} className={n<=parseInt(h.action.match(/\d/)?.[0]||"0")?"fill-current":""} style={{color:"#F59E0B"}}/>)}</div>}
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>
          {/* Composer / gestión */}
          {!DONE_STATES.includes(t.estado) || user.role==="dueno"||user.role==="admin" ? (
          <div className="border-t p-4 bg-white" style={{borderColor:LINE}}>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2} placeholder="Agregar comentario / gestión…"
              className="w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none focus:ring-2" style={{borderColor:LINE}}/>
            <div className="flex items-center gap-2 mt-2">
              <button className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border" style={{borderColor:LINE,color:MUT}}><Paperclip size={15}/>Adjuntar</button>
              <div className="relative ml-auto">
                <select value={estado} onChange={e=>setEstado(e.target.value)} className="appearance-none border rounded-lg pl-3 pr-8 py-2 text-sm bg-white outline-none font-medium" style={{borderColor:LINE,color:TEXT}}>
                  {DATA.estados.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:MUT}}/>
              </div>
              <button onClick={send} className="inline-flex items-center gap-1.5 text-white font-semibold text-sm px-4 py-2 rounded-lg" style={{background:AZUL}}><Send size={15}/>ENVIAR</button>
            </div>
          </div>
          ) : (
            <div className="border-t p-3 bg-white flex items-center justify-center gap-2 text-sm" style={{borderColor:LINE,color:MUT}}>
              <CheckCircle2 size={16} style={{color:"#15803D"}}/>El ticket está {t.estado.toLowerCase()} y no requiere más gestión.
            </div>
          )}
        </div>

        {/* DERECHA · solicitante */}
        <div className="border-l overflow-auto p-5" style={{borderColor:LINE,background:"#FBFCFE"}}>
          <div className="flex items-center gap-2.5 mb-4">
            <Avatar name={t.solicitante} size={38}/>
            <div className="min-w-0"><div className="font-semibold text-sm truncate" style={{color:TEXT}}>{t.solicitante}</div><div className="text-xs" style={{color:MUT}}>Solicitante</div></div>
          </div>
          <F label="Correo electrónico"><a className="underline break-all" style={{color:AZUL}}>{t.solicitanteCorreo}</a></F>
          <F label="Organización"><span style={{color:AZUL}}>Assetplan</span></F>
          <F label="Área">{t.area}</F>
          <F label="Hora local">{ftime(now)} GMT-3</F>
          <F label="Idioma">Español</F>
          <F label="Etiquetas"><span className="inline-block text-xs px-2 py-0.5 rounded" style={{background:"#EEF2F6",color:MUT}}>{t.responsableRol==="JOP"?"gestion_jop":"gestion_jem"}</span></F>
          {t.csat && <F label="CSAT">{[1,2,3,4,5].map(n=><Star key={n} size={15} className={n<=t.csat?"fill-current":""} style={{color:"#F59E0B",display:"inline"}}/>)}</F>}
          <div className="mt-2"><div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{color:MUT}}>Notas</div>
            <textarea rows={3} placeholder="Agregar notas del usuario" className="w-full border rounded-lg px-2.5 py-2 text-sm outline-none resize-none" style={{borderColor:LINE}}/></div>
        </div>
      </div>
    </div>
  );
}

/* ---- Reportes ---- */
function Bar({label,value,max,color}){
  const w=max?Math.round(value/max*100):0;
  return <div className="flex items-center gap-3 py-1"><span className="text-xs w-40 truncate" style={{color:MUT}}>{label}</span>
    <div className="flex-1 h-4 rounded" style={{background:"#EEF2F6"}}><div className="h-4 rounded" style={{width:w+"%",background:color}}/></div>
    <span className="text-xs font-semibold w-8 text-right" style={{color:TEXT}}>{value}</span></div>;
}
function Reportes({tickets,now}){
  const byCat={},byEd={},byResp={};
  tickets.forEach(t=>{byCat[t.categoria]=(byCat[t.categoria]||0)+1;byEd[t.edificio]=(byEd[t.edificio]||0)+1;byResp[t.responsable]=(byResp[t.responsable]||0)+1;});
  const top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);
  const catL=top(byCat,8),edL=top(byEd,8),reL=top(byResp,8);
  const maxC=Math.max(...catL.map(x=>x[1]),1),maxE=Math.max(...edL.map(x=>x[1]),1),maxR=Math.max(...reL.map(x=>x[1]),1);
  const card="rounded-xl border bg-white p-5";
  return <div className="p-6 grid md:grid-cols-2 gap-4">
    <div className={card} style={{borderColor:LINE}}><h3 className="font-bold text-sm mb-3" style={{color:TEXT}}>Tickets por categoría</h3>{catL.map(([k,v])=><Bar key={k} label={k} value={v} max={maxC} color={AZUL}/>)}</div>
    <div className={card} style={{borderColor:LINE}}><h3 className="font-bold text-sm mb-3" style={{color:TEXT}}>Tickets por edificio</h3>{edL.map(([k,v])=><Bar key={k} label={k} value={v} max={maxE} color="#0891B2"/>)}</div>
    <div className={card} style={{borderColor:LINE}}><h3 className="font-bold text-sm mb-3" style={{color:TEXT}}>Carga por responsable</h3>{reL.map(([k,v])=><Bar key={k} label={k} value={v} max={maxR} color="#6D28D9"/>)}</div>
    <div className={card} style={{borderColor:LINE}}><h3 className="font-bold text-sm mb-3" style={{color:TEXT}}>Resumen</h3>
      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Total" value={tickets.length} tone="azul"/>
        <Kpi label="Fuera de SLA" value={tickets.filter(t=>OPEN_STATES.includes(t.estado)&&t.dueAt<now).length} tone="rojo"/>
        <Kpi label="Abiertos" value={tickets.filter(t=>OPEN_STATES.includes(t.estado)).length} tone="amar"/>
        <Kpi label="Resueltos" value={tickets.filter(t=>DONE_STATES.includes(t.estado)).length} tone="verde"/>
      </div>
    </div>
  </div>;
}

/* ---- Centro de Administración ---- */
function Admin(){
  const [tab,setTab]=useState("usuarios");
  const tabs=[["usuarios","Usuarios"],["edificios","Edificios"],["categorias","Categorías y SLA"],["estados","Estados"]];
  const th="text-left text-[11px] font-bold uppercase tracking-wide px-3 py-2";
  const td="px-3 py-2 text-sm";
  return <div className="p-6">
    <div className="flex gap-1 mb-4">{tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{background:tab===k?AZUL:"#fff",color:tab===k?"#fff":TEXT,border:`1px solid ${tab===k?AZUL:LINE}`}}>{l}</button>)}</div>
    <div className="rounded-xl border bg-white overflow-hidden" style={{borderColor:LINE}}>
      <div className="max-h-[calc(100vh-210px)] overflow-auto">
      {tab==="usuarios" && <table className="w-full"><thead style={{background:"#FBFCFE"}}><tr style={{color:MUT}}><th className={th}>Nombre</th><th className={th}>Cargo</th><th className={th}>Rol</th><th className={th}>Correo</th></tr></thead>
        <tbody>{DATA.users.map((u,i)=><tr key={u.correo} style={{borderTop:`1px solid ${LINE}`}}><td className={td+" font-medium"}>{u.nombre}</td><td className={td} style={{color:MUT}}>{u.cargo}</td><td className={td}><StateChip s={({dueno:"Dueño",admin:"Administrador",jop:"JOP",jem:"JEM",solicitante:"Solicitante"})[u.role]}/></td><td className={td} style={{color:MUT}}>{u.correo}</td></tr>)}</tbody></table>}
      {tab==="edificios" && <table className="w-full"><thead style={{background:"#FBFCFE"}}><tr style={{color:MUT}}><th className={th}>Edificio</th><th className={th}>Comuna</th><th className={th}>JEM</th><th className={th}>JOP</th><th className={th}>Deptos</th></tr></thead>
        <tbody>{DATA.buildings.map(b=><tr key={b.id} style={{borderTop:`1px solid ${LINE}`}}><td className={td+" font-medium"}>{b.nombre}</td><td className={td} style={{color:MUT}}>{b.comuna}</td><td className={td}>{b.jem}</td><td className={td}>{b.jop}</td><td className={td} style={{color:MUT}}>{b.deptos}</td></tr>)}</tbody></table>}
      {tab==="categorias" && <table className="w-full"><thead style={{background:"#FBFCFE"}}><tr style={{color:MUT}}><th className={th}>Categoría</th><th className={th}>Subcategoría</th><th className={th}>Rol</th><th className={th}>Días</th><th className={th}>Horas</th><th className={th}>Prioridad</th></tr></thead>
        <tbody>{DATA.cats.map((c,i)=><tr key={i} style={{borderTop:`1px solid ${LINE}`}}><td className={td+" font-medium"}>{c.categoria}</td><td className={td}>{c.subcategoria}</td><td className={td} style={{color:MUT}}>{c.rol}</td><td className={td}>{c.dias??"—"}</td><td className={td}>{c.horas}</td><td className={td}><PrioChip p={c.prioridad}/></td></tr>)}</tbody></table>}
      {tab==="estados" && <div className="p-4 flex flex-wrap gap-2">{DATA.estados.map(s=><StateChip key={s} s={s}/>)}</div>}
      </div>
    </div>
    <p className="text-xs mt-3" style={{color:MUT}}>Vista de solo lectura en esta etapa. La edición de catálogos, SLA y reglas se habilita en la siguiente entrega.</p>
  </div>;
}

/* ---- Crear ticket ---- */
function NewTicket({user, onClose, onCreate}){
  const cats=[...new Set(DATA.cats.map(c=>c.categoria))];
  const [form,setForm]=useState({area:user.area||"Operaciones",edificio:(user.edificios&&user.edificios[0])||DATA.buildings[0].nombre,categoria:cats[0],subcategoria:"",asunto:"",descripcion:""});
  const subs=DATA.cats.filter(c=>c.categoria===form.categoria);
  useEffect(()=>{ if(!subs.find(s=>s.subcategoria===form.subcategoria)) setForm(f=>({...f,subcategoria:subs[0]?.subcategoria||""})); },[form.categoria]);
  const catDef=DATA.cats.find(c=>c.categoria===form.categoria && c.subcategoria===form.subcategoria)||subs[0];
  const create=()=>{
    if(!form.asunto.trim()) return;
    const b=DATA.buildings.find(x=>x.nombre===form.edificio);
    const isJop=catDef.rol==="JOP";
    const horas=catDef.horas||4;
    const now=Date.now();
    const tk={id:`#${900000+Math.floor(Math.random()*90000)}`,asunto:form.asunto,edificio:b.nombre,comuna:b.comuna,
      categoria:form.categoria,subcategoria:form.subcategoria,prioridad:catDef.prioridad,
      responsable:isJop?b.jop:b.jem,responsableCorreo:isJop?b.jopCorreo:b.jemCorreo,responsableRol:catDef.rol,
      solicitante:user.nombre,solicitanteCorreo:user.correo,area:form.area,estado:"Nuevo",createdAt:now,dueAt:now+horas*3600000,csat:null,
      descripcion:form.descripcion,history:[{t:now,who:user.nombre,kind:"crea",action:"creó el ticket",text:form.descripcion||form.asunto},{t:now+1000,who:"NEXO",kind:"sys",action:`asignó el ticket a ${isJop?b.jop:b.jem}`}]};
    onCreate(tk);
  };
  const L=({label,children})=><div><label className="text-xs font-semibold" style={{color:MUT}}>{label}</label>{children}</div>;
  const inp="mt-1 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2";
  const Sel=({v,set,opts})=><div className="relative"><select value={v} onChange={e=>set(e.target.value)} className={inp+" appearance-none pr-8"} style={{borderColor:LINE}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select><ChevronDown size={14} className="absolute right-2 top-1/2 pointer-events-none" style={{color:MUT}}/></div>;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"#0F172A80"}}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{borderColor:LINE}}>
          <h3 className="font-bold" style={{color:TEXT}}>Crear ticket</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100" style={{color:MUT}}><X size={18}/></button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-2 gap-3">
            <L label="Área solicitante"><input className={inp} style={{borderColor:LINE}} value={form.area} onChange={e=>setForm({...form,area:e.target.value})}/></L>
            <L label="Edificio"><Sel v={form.edificio} set={v=>setForm({...form,edificio:v})} opts={(user.role==="jop"||user.role==="jem")?(user.edificios||[]):DATA.buildings.map(b=>b.nombre)}/></L>
            <L label="Categoría"><Sel v={form.categoria} set={v=>setForm({...form,categoria:v})} opts={cats}/></L>
            <L label="Subcategoría"><Sel v={form.subcategoria} set={v=>setForm({...form,subcategoria:v})} opts={subs.map(s=>s.subcategoria)}/></L>
          </div>
          {catDef && <div className="flex items-center gap-2 text-xs" style={{color:MUT}}><PrioChip p={catDef.prioridad}/><span>SLA {catDef.horas} h · se asigna a {catDef.rol}</span></div>}
          <L label="Asunto"><input className={inp} style={{borderColor:LINE}} value={form.asunto} onChange={e=>setForm({...form,asunto:e.target.value})} placeholder="Resumen breve de la solicitud"/></L>
          <L label="Descripción"><textarea rows={4} className={inp+" resize-none"} style={{borderColor:LINE}} value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} placeholder="Detalle del problema o pedido"/></L>
          <button className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border" style={{borderColor:LINE,color:MUT}}><Paperclip size={15}/>Adjuntar archivo</button>
        </div>
        <div className="px-5 py-3.5 border-t flex justify-end gap-2" style={{borderColor:LINE}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{borderColor:LINE,color:TEXT}}>Cancelar</button>
          <button onClick={create} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{background:AZUL}}>Crear ticket</button>
        </div>
      </div>
    </div>
  );
}

/* ================= APP ================= */
export default function App(){
  const [screen,setScreen]=useState("welcome");
  const [user,setUser]=useState(null);
  const [tickets,setTickets]=useState(()=>seedTickets());
  const [nav,setNav]=useState("soporte");
  const [selId,setSelId]=useState(null);
  const [search,setSearch]=useState("");
  const [showNew,setShowNew]=useState(false);
  const now=Date.now();

  useEffect(()=>{
    const l=document.createElement("link");
    l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(l);
    const s=document.createElement("style");
    s.textContent=`*{font-family:'Manrope',system-ui,sans-serif}`;
    document.head.appendChild(s);
  },[]);

  const login=(u)=>{setUser(u);setNav(u.role==="solicitante"?"mis":"soporte");setScreen("app");};
  const logout=()=>{setUser(null);setSelId(null);setScreen("welcome");};

  const vis=useMemo(()=>visibleTickets(user,tickets),[user,tickets]);
  const searched=useMemo(()=>{
    if(!search.trim()) return vis;
    const q=search.toLowerCase();
    return vis.filter(t=>[t.id,t.asunto,t.edificio,t.solicitante,t.categoria,t.responsable].join(" ").toLowerCase().includes(q));
  },[vis,search]);

  if(screen==="welcome") return <Welcome onEnter={()=>setScreen("login")}/>;
  if(screen==="login") return <Login onLogin={login} onBack={()=>setScreen("welcome")}/>;

  const sel=selId? tickets.find(t=>t.id===selId):null;
  const roleLabel={dueno:"Dueño",admin:"Administrador",jop:"Jefe de Operaciones",jem:"Jefe de Edificio",solicitante:"Solicitante"}[user.role];
  const scopeSub = user.role==="jem"||user.role==="jop" ? `${user.edificios.length} edificio(s) a cargo` :
                   user.role==="solicitante" ? "Tus solicitudes" : "Todos los edificios";

  return (
    <div className="min-h-screen flex" style={{background:"#F7F9FC",color:TEXT}}>
      {!sel && <Sidebar user={user} nav={nav} setNav={setNav} onLogout={logout}/>}
      <main className="flex-1 min-w-0">
        {sel ? (
          <TicketDetail t={sel} user={user} now={now} onBack={()=>setSelId(null)}
            onUpdate={(nt)=>setTickets(ts=>ts.map(x=>x.id===nt.id?nt:x))}/>
        ) : (
          <>
            <Topbar
              title={ nav==="soporte"?"Soporte": nav==="dash"?"Dashboard": nav==="reportes"?"Reportes": nav==="admin"?"Centro de Administración": "Mis solicitudes"}
              subtitle={`${user.nombre} · ${roleLabel} · ${scopeSub}`}
              onNew={()=>setShowNew(true)} search={search} setSearch={setSearch}/>
            {nav==="soporte" && <TicketList tickets={searched} user={user} now={now} onOpen={setSelId}/>}
            {nav==="dash" && <Dashboard tickets={searched} user={user} now={now} onOpen={setSelId}/>}
            {nav==="mis" && <TicketList tickets={searched} user={user} now={now} onOpen={setSelId}/>}
            {nav==="reportes" && <Reportes tickets={vis} now={now}/>}
            {nav==="admin" && <Admin/>}
          </>
        )}
      </main>
      {showNew && <NewTicket user={user} onClose={()=>setShowNew(false)} onCreate={(tk)=>{setTickets(ts=>[tk,...ts]);setShowNew(false);setSelId(tk.id);}}/>}
    </div>
  );
}
