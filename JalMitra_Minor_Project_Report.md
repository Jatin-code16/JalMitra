**JALMITRA – SMART IRRIGATION ASSISTANT FOR SMALLHOLDER FARMERS**

*Smart Farming. Smarter Irrigation.*
---

## TABLE OF CONTENTS

| Section | Title |
|---|---|
| | Abstract |
| | List of Tables |
| | List of Figures |
| | List of Abbreviations |
| **Chapter 1** | **Introduction** |
| 1.1 | Background and Motivation |
| 1.2 | Project Objectives |
| 1.3 | Organization of the Report |
| **Chapter 2** | **Literature Review** |
| 2.1 | Evolution of Smart Irrigation Systems |
| 2.2 | Edge AI and TinyML in Precision Agriculture |
| 2.3 | IoT Sensor Systems for Agriculture |
| 2.4 | Voice Interfaces for Rural Technology Adoption |
| 2.5 | Comparative Analysis |
| **Chapter 3** | **Problem Identification** |
| 3.1 | Problem Analysis |
| 3.2 | Problem Statement |
| 3.3 | Scope of the System |
| **Chapter 4** | **Proposed Methodology** |
| 4.1 | System Overview |
| 4.2 | Hardware Design |
| 4.2.1 | ESP32 Microcontroller (Espressif ESP32 DevKit V1) |
| 4.2.2 | Capacitive Soil Moisture Sensor |
| 4.2.3 | DHT22 (AM2302) Temperature and Humidity Sensor |
| 4.2.4 | SIM800L GSM Module |
| 4.2.5 | Relay Module and Pump Control |
| 4.3 | Software Architecture |
| 4.3.1 | ESP32 Firmware |
| 4.3.2 | Backend — FastAPI (Python) |
| 4.3.3 | Android Application — React Native + Expo |
| 4.3.4 | Firebase Realtime Database |
| 4.4 | On-Device AI Module (TensorFlow Lite) |
| 4.5 | Hindi/Hinglish Voice Interaction |
| 4.6 | Safety Architecture |
| **Chapter 5** | **Results** |
| 5.1 | Functional Outcomes |
| 5.2 | Performance Metrics |
| 5.3 | AI Model Performance |
| 5.4 | Field Trials and Market Validation |
| 5.5 | User Interface Results |
| **Chapter 6** | **Conclusion and Future Scope** |
| 6.1 | Conclusion |
| 6.2 | Future Work |
| | **Bibliography** |
| | **Appendix A** — Key API Endpoints |
| | **Appendix B** — TinyML Model Training Parameters |
| | **Appendix C** — ESP32 Pin Configuration Table |

---

## ABSTRACT

Agriculture remains the backbone of the Indian economy, sustaining the livelihoods of over 58% of the population. However, approximately 130 million farm holdings in India — of which nearly 85% are classified as small and marginal — continue to depend on manual observation and guesswork for irrigation decisions. This practice results in significant wastage of water, electricity, and labour, with direct adverse effects on crop yield, particularly for staple crops such as paddy, maize, and vegetables cultivated in the state of Chhattisgarh. Existing smart irrigation platforms, while technologically advanced, remain inaccessible to smallholder farmers owing to high infrastructure costs, dependency on continuous internet connectivity, English-only interfaces, and operational complexity.

This report presents **JalMitra**, a low-cost, offline-capable, Hindi-first smart irrigation assistant designed specifically for smallholder farmers. The system comprises three integrated components: (1) a **Field Node Kit** built around the Espressif ESP32 microcontroller interfaced with a capacitive soil moisture sensor, DHT22 temperature and humidity sensor, 5V relay module, and SIM800L GSM module for dual-mode connectivity; (2) a **React Native + Expo Android application** featuring a live soil dashboard, one-tap pump control, and Hindi/Hinglish voice interaction via the Android SpeechRecognizer API; and (3) an **AI + Backend Intelligence layer** comprising a TensorFlow Lite on-device machine learning model for offline irrigation scheduling and a FastAPI backend with Firebase Realtime Database for cloud synchronisation.

Validation results demonstrate an AI model precision of 87%, recall of 84%, and F1 score of 85% on a test dataset of 500+ samples. Field trials across 6+ villages involving 25+ farmers recorded an average water usage reduction of approximately 22%, electricity savings of 18%, and daily time savings of 30 minutes. Continuous hardware operation was verified for 72+ hours with relay switching reliability of 100%. A market study of 150+ farmers indicated 78% strong adoption interest. These results affirm the viability of JalMitra as a practical precision agriculture tool for underserved rural communities in Chhattisgarh.

---

## LIST OF TABLES

| Table No. | Title | Chapter |
|---|---|---|
| Table 1 | Comparative Analysis of Irrigation Systems | Chapter 2 |
| Table 2 | Hardware Component Specifications | Chapter 4 |
| Table 3 | ESP32 Pin Configuration | Chapter 4 |
| Table 4 | TinyML Model Training Parameters | Chapter 4 |
| Table 5 | Performance Metrics — Target vs Achieved | Chapter 5 |
| Table 6 | AI Model Validation Results | Chapter 5 |
| Table 7 | Field Trial Impact Summary | Chapter 5 |
| Table 8 | Key API Endpoints | Appendix A |

---

## LIST OF FIGURES

| Figure No. | Title | Chapter |
|---|---|---|
| Figure 3.1 | Challenges Faced by Smallholder Farmers in Irrigation | Chapter 3 |
| Figure 4.1 | High-Level System Architecture of JalMitra | Chapter 4 |
| Figure 4.2 | End-to-End Technology Flow | Chapter 4 |
| Figure 4.3 | Hardware Circuit Diagram of JalMitra Field Node Kit | Chapter 4 |
| Figure 4.4 | TensorFlow Lite On-Device AI Model Decision Flow | Chapter 4 |
| Figure 4.5 | Hindi/Hinglish Voice Interaction Flow Diagram | Chapter 4 |
| Figure 4.6 | FastAPI Backend Architecture and Endpoints | Chapter 4 |
| Figure 4.7 | Firebase Realtime Database Schema | Chapter 4 |
| Figure 4.8 | Safety Architecture at ESP32 Firmware Level | Chapter 4 |
| Figure 5.1 | JalMitra Android App — Dashboard Screen | Chapter 5 |
| Figure 5.2 | JalMitra Android App — Pump Control Screen | Chapter 5 |
| Figure 5.3 | JalMitra Android App — Voice Assistant Interaction | Chapter 5 |
| Figure 5.4 | Verification Result — Field Trial Water Usage Comparison | Chapter 5 |
| Figure 5.5 | AI Model Confusion Matrix | Chapter 5 |

---

## LIST OF ABBREVIATIONS

| Abbreviation | Full Form |
|---|---|
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| ASP | Average Selling Price |
| BLE | Bluetooth Low Energy |
| BOM | Bill of Materials |
| CI/CD | Continuous Integration / Continuous Deployment |
| CSV | Comma-Separated Values |
| CSVTU | Chhattisgarh Swami Vivekanand Technical University |
| DHT | Digital Humidity and Temperature |
| ESP32 | Espressif Systems ESP32 Microcontroller |
| FastAPI | Fast Application Programming Interface (Python Framework) |
| FPO | Farmer Producer Organisation |
| GPIO | General-Purpose Input/Output |
| GSM | Global System for Mobile Communications |
| HTTP | Hypertext Transfer Protocol |
| IoT | Internet of Things |
| JWT | JSON Web Token |
| KVK | Krishi Vigyan Kendra |
| ML | Machine Learning |
| MQTT | Message Queuing Telemetry Transport |
| NLU | Natural Language Understanding |
| PMKSY | Pradhan Mantri Krishi Sinchai Yojana |
| PWM | Pulse Width Modulation |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SIM | Subscriber Identity Module |
| SQLite | Structured Query Language Lite |
| TFLite | TensorFlow Lite |
| TinyML | Tiny Machine Learning |
| TTS | Text-to-Speech |
| UI | User Interface |
| UX | User Experience |

---

## Chapter 1 — Introduction

### 1.1 Background and Motivation

India is one of the largest agrarian economies in the world, with agriculture contributing approximately 18% to the national Gross Domestic Product (GDP) and sustaining the livelihoods of over 58% of the country's population. The sector encompasses more than 130 million farm holdings, of which approximately 85% are classified as small and marginal, with landholdings of less than two hectares. These smallholder farmers form the backbone of India's food security framework, yet they consistently face systemic challenges in accessing modern agricultural technologies that could significantly improve their productivity and resource efficiency.

Water scarcity and its efficient management represent one of the most pressing challenges in Indian agriculture. India accounts for approximately 18% of the world's population but possesses only 4% of the world's freshwater resources. Agriculture alone consumes nearly 80% of the country's available freshwater, with a significant proportion lost to inefficient irrigation practices. In the state of Chhattisgarh, where the primary crops include paddy (rice), maize, and various vegetables, farmers overwhelmingly rely on flood irrigation and manual guesswork to determine irrigation timing and duration. The consequences of this approach are multifaceted: over-irrigation leads to waterlogging, root damage, and soil nutrient leaching, while under-irrigation causes crop stress, reduced photosynthesis, and diminished yield. Both scenarios result in wasted water, excessive electricity consumption for running pumps, and unnecessary expenditure of time and labour.

The advent of smart irrigation technologies, driven by advances in the Internet of Things (IoT), Artificial Intelligence (AI), and sensor engineering, has demonstrated the potential to transform agricultural water management. Published literature indicates that sensor-based irrigation systems can achieve water savings of 40–65% while maintaining or improving crop yields. Commercial platforms such as Fasal and AgroStar have made significant strides in precision agriculture within India. However, these solutions are designed primarily for medium-to-large farms with high-value crops, requiring expensive drip or fertigation infrastructure, continuous broadband internet connectivity, technical literacy for operation, and subscription-based pricing models. For a smallholder farmer in the Bhilai–Durg district of Chhattisgarh, cultivating paddy on two acres with an existing tubewell and electric pump, such systems remain entirely out of reach.

The digital divide in rural Chhattisgarh further compounds this accessibility gap. Smartphone penetration, while growing, is characterised by low-end Android devices with limited storage and processing capability. Internet connectivity in many villages is intermittent at best, with 2G GSM coverage being the only reliable communication channel in numerous areas. The predominant language of interaction is Hindi or Hinglish (a code-mixed form of Hindi and English), and digital literacy levels remain low, particularly among older farming communities. Any technology solution that does not account for these ground realities is destined to remain a laboratory demonstration rather than a field-deployable tool.

It was this fundamental gap — between the proven potential of precision irrigation technology and the practical accessibility constraints of Chhattisgarh's smallholder farmers — that motivated the conception and development of JalMitra. The project was conceived with the conviction that precision agriculture need not be expensive, complex, or connectivity-dependent to be effective. By combining a low-cost IoT retrofit kit (estimated Bill of Materials cost of ₹1,350 per unit) with an offline-capable, Hindi-first Android application powered by on-device TensorFlow Lite AI, JalMitra seeks to place actionable irrigation intelligence directly in the hands of the farmers who need it most.

### 1.2 Project Objectives

The following objectives were defined for the design, development, and validation of the JalMitra system:

1. **Design and prototype a low-cost IoT field node** based on the Espressif ESP32 microcontroller, interfaced with a capacitive soil moisture sensor, DHT22 (AM2302) temperature and humidity sensor, 5V relay module, and SIM800L GSM module, capable of retrofitting to any existing tubewell or electric pump without requiring infrastructure replacement.

2. **Implement an on-device TensorFlow Lite AI model** that analyses soil moisture history, crop type (paddy, maize, vegetables), soil profile (black cotton, loamy, red soil), and weather forecast data to generate recommended irrigation start times and durations, operating entirely offline on the farmer's Android device.

3. **Ensure full offline operation** through a dual-mode architecture comprising local ESP32 threshold-based fallback logic and GSM-based connectivity via SIM800L, guaranteeing system functionality in the complete absence of Wi-Fi or broadband internet.

4. **Develop a Hindi/Hinglish voice interface** utilising the Android SpeechRecognizer API to enable hands-free, literacy-independent farmer interaction with the system, supporting natural-language commands for irrigation queries, pump control, status checks, and help requests.

5. **Build a React Native + Expo Android application** featuring a live soil moisture dashboard, one-tap pump control with safety confirmation, AI-generated irrigation recommendations, historical logs, and a notification system, designed with large tap targets, icon-heavy layouts, and Hindi-first labelling for low-literacy users.

6. **Implement a FastAPI backend with Firebase Realtime Database** for cloud synchronisation, centralised data storage, remote monitoring, and administrative functions, enabling data sync when connectivity is available without requiring it for core system operation.

7. **Enforce hardware-level safety mechanisms** at the ESP32 firmware level, including a maximum pump runtime limit to prevent motor damage, a minimum re-irrigation gap to prevent waterlogging, an offline threshold fallback for AI-unavailable scenarios, and a manual override switch for full farmer control.

### 1.3 Organization of the Report

The remainder of this report is organised as follows. **Chapter 2** presents a comprehensive literature review covering the evolution of smart irrigation systems, the emergence of Edge AI and TinyML in precision agriculture, IoT sensor systems for agricultural applications, voice interfaces for rural technology adoption, and a comparative analysis of existing irrigation approaches. **Chapter 3** identifies and analyses the specific problems addressed by JalMitra, formulates the problem statement, and defines the scope and boundaries of the system. **Chapter 4** details the proposed methodology, encompassing the complete hardware design, software architecture, on-device AI module, Hindi/Hinglish voice interaction system, and safety architecture. **Chapter 5** presents the results of system validation, including functional outcomes, performance metrics, AI model evaluation, field trial data, market validation findings, and user interface demonstrations. **Chapter 6** concludes the report with a summary of contributions and outlines the future scope of the project. The report concludes with the Bibliography and three Appendices covering Key API Endpoints, TinyML Model Training Parameters, and ESP32 Pin Configuration.

---

## Chapter 2 — Literature Review

### 2.1 Evolution of Smart Irrigation Systems

The history of irrigation technology represents a progressive journey from entirely manual practices to increasingly automated and intelligent systems. This evolution may be broadly categorised into five distinct generations, each representing a significant advancement in capability but also introducing its own set of limitations, particularly with respect to smallholder farmer adoption.

The **first generation** of irrigation comprised flood and manual irrigation methods, which have been practised for millennia. In this approach, the farmer visually inspects the soil surface, assesses crop condition by observation, and makes irrigation decisions based on experience and intuition. While this method requires no technology investment and remains the dominant practice among smallholder farmers in Chhattisgarh and across much of rural India, it is inherently imprecise. Research has consistently demonstrated that manual irrigation leads to both over-irrigation (resulting in waterlogging, nutrient leaching, and root damage) and under-irrigation (resulting in crop stress and yield reduction), with water wastage estimated at 40–60% compared to optimised methods.

The **second generation** introduced timer-based irrigation systems, which automate pump operation on fixed schedules. These systems, while reducing manual labour, operate without any real-world feedback from the soil or atmosphere. A timer set to irrigate at 6:00 AM for 30 minutes will execute identically regardless of whether it rained overnight or whether a heat wave is desiccating the field. The disconnect between fixed schedules and dynamic field conditions limits the water-saving potential of timer-based systems, and they offer no protection against over-irrigation during wet periods.

The **third generation** marked the introduction of sensor-based threshold systems, which incorporated soil moisture sensors (resistive or capacitive) to trigger irrigation only when soil moisture dropped below a predefined threshold. This reactive approach represented a significant improvement, as irrigation decisions were now data-informed rather than time-based. However, threshold systems are inherently reactive rather than predictive — they respond to moisture deficits after they occur rather than anticipating them based on weather forecasts, crop growth stage, or evapotranspiration modelling. Furthermore, early resistive soil moisture sensors suffered from corrosion and degradation in field conditions, reducing long-term reliability.

The **fourth generation** comprises cloud-connected AI irrigation platforms, which combine real-time sensor data with cloud-based machine learning models, weather API integration, satellite imagery, and agronomic databases to generate precise, predictive irrigation schedules. Commercial platforms such as Fasal (India), CropX (Israel), and Netafim (Israel) exemplify this generation. While technically superior, these systems exhibit critical limitations for smallholder adoption: they require continuous broadband internet connectivity for cloud inference, demand expensive drip or fertigation infrastructure for automated application, involve subscription-based pricing models, and typically operate through English-language interfaces designed for technically literate users. The dependency on uninterrupted cloud connectivity renders these platforms non-functional in the very rural areas where irrigation optimisation is most needed.

The **fifth generation**, now emerging, leverages Edge AI and TinyML (Tiny Machine Learning) to bring inference capabilities directly to the device — either on the microcontroller (such as ESP32) or on the farmer's smartphone. This approach eliminates the dependency on cloud connectivity for decision-making while retaining the benefits of machine learning-based irrigation scheduling. JalMitra positions itself firmly within this fifth generation, implementing on-device TensorFlow Lite inference on the farmer's Android phone with a local threshold fallback on the ESP32 for scenarios where even the phone is unavailable.

### 2.2 Edge AI and TinyML in Precision Agriculture

TinyML refers to the practice of running machine learning models on resource-constrained devices — microcontrollers with kilobytes of memory, mobile devices with limited processing power, and embedded systems without dedicated GPU hardware. The field has gained significant momentum since 2019, driven by advances in model quantisation (reducing model weights from 32-bit floating-point to 8-bit integers without significant accuracy loss), neural architecture search for compact model topologies, and optimised inference runtimes such as TensorFlow Lite and TensorFlow Lite Micro.

The relevance of TinyML to Indian agriculture is particularly compelling. In a country where over 600,000 villages have varying degrees of internet connectivity — ranging from 4G broadband to intermittent 2G coverage to no connectivity whatsoever — any AI system that depends on cloud inference for its core function excludes a significant proportion of its intended user base. On-device inference addresses this constraint directly: the trained model, once deployed to the farmer's Android device or embedded in the ESP32 firmware, operates entirely independently of network availability. Inference latency is reduced from seconds (cloud round-trip) to milliseconds (local computation), and the system is resilient to network outages, server downtime, and bandwidth limitations.

Prior academic work has demonstrated the viability of edge ML in agricultural contexts. Researchers have successfully deployed TinyML models for crop-yield prediction based on environmental sensor data, soil type classification from spectral measurements, pest and disease detection from leaf images, and irrigation scheduling from soil moisture time-series data. The common thread in these studies is the use of compact model architectures — shallow neural networks, decision-tree ensembles, or quantised multi-layer perceptrons — that achieve acceptable accuracy within the memory and compute constraints of edge devices.

JalMitra adopts this design philosophy by implementing a TensorFlow Lite model that performs both binary classification (irrigate or skip) and regression (recommended duration in minutes) from a feature set comprising soil moisture history, crop type, soil profile, time of day, and OpenWeatherMap weather forecast data. The model is quantised to INT8 post-training, resulting in a model size of less than 500 KB that can be embedded directly in the Android application APK and executed with an inference latency of less than 50 milliseconds. This approach ensures that the AI decision-making capability of JalMitra remains available to the farmer regardless of connectivity conditions.

### 2.3 IoT Sensor Systems for Agriculture

The Internet of Things (IoT) has emerged as a transformative technology for precision agriculture, enabling continuous, automated monitoring of field conditions that were previously assessed only through periodic manual inspection. The selection of appropriate sensor hardware, communication protocols, and microcontroller platforms is critical to the practical viability of agricultural IoT deployments, particularly in cost-sensitive and environmentally demanding field conditions.

The **Espressif ESP32** has established itself as the de facto standard microcontroller for low-cost IoT applications. Its dual-core Xtensa LX6 processor operating at 240 MHz provides sufficient computational power for sensor data acquisition, local processing, and communication management. Integrated Wi-Fi (IEEE 802.11 b/g/n) and Bluetooth 4.2/BLE connectivity eliminate the need for external communication modules in Wi-Fi-covered areas, while 34 programmable GPIO pins, a 12-bit Analog-to-Digital Converter (ADC), and multiple UART interfaces support a wide range of sensor and peripheral connections. At a unit cost of approximately ₹300–400, the ESP32 offers an exceptional cost-to-capability ratio for agricultural IoT nodes.

For soil moisture measurement, **capacitive sensors** are preferred over older resistive sensors for agricultural deployments. Resistive sensors measure soil moisture by passing an electrical current through the soil between two exposed metal probes — a method that is inherently destructive to the probes due to electrolytic corrosion, resulting in sensor degradation and drift within weeks of field deployment. Capacitive sensors, by contrast, measure the dielectric permittivity of the soil, which varies with moisture content, through a sealed electrode that is not in direct electrical contact with the soil. This design provides superior durability, long-term stability, and resistance to the corrosive salts present in agricultural soils. The capacitive sensor employed in JalMitra produces an analog output voltage (0–3.3V) that is mapped to a 0–100% moisture range, with a lab-validated accuracy of ±3%.

The **DHT22 (AM2302)** was selected for temperature and humidity measurement over the less expensive DHT11 due to its significantly superior specifications: a temperature accuracy of ±0.5°C (versus ±2°C for DHT11), a broader temperature range of -40°C to +80°C (critical for Chhattisgarh's summer peaks exceeding 45°C), and a humidity accuracy of ±2–5% RH. Temperature and humidity data are essential inputs to the irrigation decision model, as high temperature and low humidity conditions indicate elevated evapotranspiration rates, accelerating soil moisture depletion and increasing the likelihood that irrigation will be required.

For communication in areas beyond Wi-Fi coverage, the **SIM800L GSM/GPRS module** provides a reliable fallback. Operating on quad-band GSM frequencies and communicating with the ESP32 via UART, the SIM800L enables data transmission over 2G cellular networks, which remain the most widely available mobile network technology in rural India. Lab testing confirmed a GSM connectivity success rate exceeding 95%.

The **MQTT (Message Queuing Telemetry Transport)** protocol, designed specifically for low-bandwidth, high-latency, and unreliable network conditions, is employed for IoT messaging between the ESP32 field node and the backend server. MQTT's publish-subscribe model, minimal packet overhead, and support for Quality of Service (QoS) levels make it particularly well-suited for agricultural IoT deployments where network conditions are unpredictable.

### 2.4 Voice Interfaces for Rural Technology Adoption

Research in Human-Computer Interaction (HCI) for developing regions has consistently demonstrated that vernacular voice interfaces significantly improve technology adoption rates among populations with limited literacy and digital experience. Studies conducted across rural India, Sub-Saharan Africa, and Southeast Asia have shown that voice-based interaction reduces cognitive load, eliminates the need for text-based input (which requires both literacy and familiarity with touchscreen keyboards), and aligns with the oral communication traditions prevalent in rural communities.

The Android SpeechRecognizer API provides speech-to-text functionality that supports Hindi and several other Indian languages. While the API achieves reasonable accuracy for standard Hindi speech, it faces challenges in the agricultural field context: ambient noise from machinery, wind, and livestock; accent and dialectal variations across districts; and extensive code-switching between Hindi, Hinglish, and regional vocabulary such as Chhattisgarhi. These challenges necessitate a robust Natural Language Understanding (NLU) layer that can tolerate recognition errors and map imprecise speech inputs to correct system actions.

JalMitra employs a **rule-based NLU** approach rather than a full Natural Language Processing (NLP) pipeline. This design choice was informed by three considerations. First, rule-based systems are deterministic — the same input always produces the same output, which is critical for safety-relevant actions such as pump control. Second, rule-based systems operate entirely offline, without requiring cloud-based NLP services. Third, the constrained action space of JalMitra (irrigation query, pump ON/OFF, status check, help) is well-suited to a pattern-matching approach where recognised Hindi/Hinglish phrases are mapped to predefined intents. Example farmer commands include "Aaj paani dena hai?" (Should I water today?), "Pump chalu kardo" (Turn the pump on), and "Kheti kaisi hai?" (How is the crop doing?). Text-to-Speech (TTS) responses deliver AI recommendations back to the farmer in spoken Hindi, completing a fully voice-driven interaction loop that requires no reading or typing.

### 2.5 Comparative Analysis

A structured comparison of JalMitra with existing irrigation approaches is presented in Table 1. The comparison evaluates systems across nine dimensions that are critical for smallholder farmer adoption in Chhattisgarh.

*Table 1: Comparative Analysis of Irrigation Systems*

| Feature | Manual Irrigation | Timer-Based Systems | Cloud-Only Smart Systems | JalMitra (Proposed) |
|---|---|---|---|---|
| Cost | Very Low | Low–Medium | High | Low (₹1,500–2,000) |
| Connectivity Required | None | None | Constant | Optional (GSM fallback) |
| Hindi/Local Language Support | N/A | None | Rare | Yes (Hindi/Hinglish voice) |
| AI Decision-Making | None | None | Cloud-based | On-device (TFLite) |
| Offline Capable | Yes (manual) | Yes (fixed schedule) | No | Yes (threshold fallback) |
| Farmer Accessibility | High | Medium | Low | High |
| Retrofit to Existing Pump | Yes | Partial | No | Yes |
| Safety Logic | None | Basic | Software-only | Firmware-level (ESP32) |
| Smallholder Focus | Yes | No | No | Yes |

The analysis reveals that JalMitra occupies a unique position in the irrigation technology landscape: it is the only system that combines AI-powered decision-making with offline capability, Hindi-first voice interaction, retrofit compatibility with existing pumps, and firmware-level safety logic at a price point accessible to smallholder farmers. Cloud-only smart systems, while technologically sophisticated, fail on connectivity dependence, cost, and farmer accessibility — the three most critical adoption barriers in rural Chhattisgarh.

---

## Chapter 3 — Problem Identification

### 3.1 Problem Analysis

A systematic analysis of the challenges faced by smallholder farmers in Chhattisgarh with respect to irrigation management revealed four primary problem areas that collectively define the need for a solution such as JalMitra.

**Problem 1: Water and Electricity Wastage from Guesswork Irrigation.** The overwhelming majority of smallholder farmers in the Bhilai–Durg district and across Chhattisgarh determine irrigation timing and duration through visual inspection of the soil surface, observation of crop wilting, or adherence to fixed weekly or bi-weekly schedules inherited from traditional farming practices. This guesswork-based approach is fundamentally flawed because soil moisture distribution is non-uniform across a field, surface appearance does not accurately reflect subsurface moisture conditions at root depth, and crop water requirements vary dynamically with temperature, humidity, growth stage, and soil type. The consequences are twofold: over-irrigation leads to waterlogging, anaerobic root conditions, nutrient leaching, and wasteful consumption of water and electricity for pump operation; under-irrigation leads to crop stress, reduced photosynthesis, stunted growth, and diminished yield. Initial field trials conducted as part of this project demonstrated that sensor-guided irrigation decisions reduced average water usage by approximately 22% compared to farmer-directed guesswork — confirming that a significant proportion of current water and electricity consumption is avoidable.

**Problem 2: High Cost and Complexity of Existing Smart Irrigation Systems.** Commercial precision irrigation platforms currently available in the Indian market, such as Fasal, are designed for medium-to-large farming operations with high-value crops (grapes, pomegranates, sugarcane) where the return on investment justifies the capital expenditure. These platforms typically require the installation of drip or fertigation infrastructure (which itself costs ₹40,000–80,000 per acre), dedicated field stations with solar panels and gateways, continuous broadband internet connectivity for cloud-based inference, and annual subscription fees for software services. A smallholder farmer cultivating paddy or maize on less than 5 acres with an existing tubewell or electric pump — and earning a seasonal income that may range from ₹30,000 to ₹80,000 — cannot justify or afford such investment. Market surveys conducted during this project, covering 150+ farmers, confirmed that the willingness to pay for an irrigation assistance device ranges between ₹1,500 and ₹2,000, with a strong expectation that the device should work with the farmer's existing pump without requiring any additional infrastructure.

**Problem 3: Connectivity Dependence in Rural Chhattisgarh.** A fundamental architectural limitation of cloud-dependent smart irrigation systems is their total reliance on uninterrupted internet connectivity for AI inference and remote control functions. In many villages across Chhattisgarh, Wi-Fi broadband is either unavailable or restricted to a few community access points. Mobile data connectivity, where available, is often limited to intermittent 2G/3G coverage with high latency and frequent dropouts. A smart irrigation system that ceases to function — or degrades to a passive sensor display — when the internet connection drops is of limited practical value in these environments. JalMitra's dual-mode connectivity architecture (Wi-Fi + GSM via SIM800L) and on-device AI inference (TensorFlow Lite on Android + threshold fallback on ESP32) were designed specifically to address this constraint, ensuring that the system's core irrigation decision-making and pump control functions remain fully operational even in the complete absence of internet connectivity.

**Problem 4: Language Barrier and Low Digital Literacy.** The language and interface design of existing agricultural technology applications represent a significant barrier to adoption among smallholder farmers in Chhattisgarh. The majority of available platforms operate in English, with limited or superficial Hindi localisation that does not extend to voice interaction. For farmers whose primary language of communication is Hindi or Hinglish, and whose digital literacy is limited to basic smartphone operations (calling, WhatsApp messaging), navigating an English-language application with complex menus, data visualisations, and technical terminology is a prohibitive challenge. Market validation studies conducted during this project — encompassing 150+ farmer surveys and 8 focus group discussions — confirmed that the single most requested feature was a simple Hindi-language application with voice support. Without localised, voice-enabled interfaces that match the linguistic and cognitive context of the target user, agricultural technology adoption in rural Chhattisgarh will remain marginal.

*Figure 3.1: Challenges Faced by Smallholder Farmers in Irrigation*

### 3.2 Problem Statement

The present project addresses the absence of a unified, low-cost, offline-capable platform that combines real-time soil sensing, on-device AI-powered irrigation scheduling, Hindi/Hinglish voice interaction, and safe relay-based pump control in a single retrofit solution accessible to smallholder farmers in Chhattisgarh. Specifically, JalMitra is designed to bridge the gap between the demonstrated potential of precision irrigation technology — which literature indicates can save 40–65% water while maintaining yields — and the practical accessibility constraints of small and marginal farmers who operate on limited budgets, use existing pumps, face intermittent or absent internet connectivity, and interact primarily in Hindi. The system must function reliably in field conditions, enforce safety mechanisms to protect both the pump and the crop, and present its intelligence through an interface that a farmer with minimal digital literacy can operate independently using voice commands.

### 3.3 Scope of the System

The scope of the JalMitra system, as developed and validated during this project, is defined below.

**In Scope:**
- ESP32-based IoT field node with capacitive soil moisture sensing, DHT22 temperature and humidity sensing, SIM800L GSM/GPRS connectivity, and 5V relay-based pump control
- TensorFlow Lite on-device AI model for irrigation scheduling, operating fully offline on the farmer's Android device
- Hindi/Hinglish voice interaction using the Android SpeechRecognizer API with rule-based NLU for intent recognition
- React Native + Expo Android application with live soil dashboard, one-tap pump control, AI recommendations, historical logs, and notification system
- FastAPI (Python) backend with Firebase Realtime Database for cloud synchronisation, data storage, and remote monitoring
- ESP32 firmware-level safety mechanisms: maximum pump runtime limit, minimum re-irrigation gap, offline threshold fallback, and manual override switch
- Support for three crop types: Paddy/Rice, Maize, and Vegetables
- Calibration and validation for three Chhattisgarh soil types: Black cotton, Loamy, and Red soil

**Out of Scope:**
- Drip irrigation system integration and fertigation control
- Solar panel integration and autonomous power management
- Multi-farm enterprise dashboard and fleet management
- Crop disease detection from leaf imagery
- Water quality sensing and contamination detection
- Soil nutrient analysis and fertiliser recommendation

**Target User Profile:**
The primary target user of JalMitra is a smallholder farmer with a landholding of less than 5 acres, cultivating paddy, maize, or vegetables, using an existing electric or diesel pump connected to a tubewell or borewell, located primarily in the Bhilai–Durg district of Chhattisgarh with planned expansion across the state. The target user is assumed to possess a basic Android smartphone, communicate primarily in Hindi or Hinglish, and have limited digital literacy.

---

## Chapter 4 — Proposed Methodology

### 4.1 System Overview

JalMitra is designed as a three-product integrated system, where each product addresses a specific layer of the precision irrigation workflow and can operate independently or in concert with the other components.

**Product 1 — JalMitra Field Node Kit:** A low-cost IoT retrofit kit built around the Espressif ESP32 DevKit V1 microcontroller, interfaced with a capacitive soil moisture sensor, DHT22 (AM2302) temperature and humidity sensor, 5V relay module for pump control, and SIM800L GSM module for connectivity in Wi-Fi-unavailable areas. The estimated Bill of Materials (BOM) cost per kit is ₹1,350, with an Average Selling Price (ASP) of ₹1,800, yielding a gross margin of ₹450 (25%) per unit. The kit is designed to connect to any existing tubewell or electric pump without requiring infrastructure replacement.

**Product 2 — JalMitra Android App:** A React Native + Expo mobile application designed with a Hindi-first, icon-heavy interface for low-literacy users. The application provides a live soil moisture dashboard, one-tap pump control with safety confirmation, AI-generated irrigation recommendations, Hindi/Hinglish voice interaction via the Android SpeechRecognizer API, historical logs, and notification alerts. A TensorFlow Lite model is embedded within the application APK, enabling fully offline AI inference on the farmer's device.

**Product 3 — AI + Backend Intelligence:** The intelligence layer comprises two components. The on-device TFLite model analyses soil moisture history, crop type, soil profile, and weather forecast data to generate irrigation start time and duration recommendations, operating entirely on the Android device without network dependency. The cloud backend, built with FastAPI (Python) and Firebase Realtime Database, provides data synchronisation, historical storage, remote monitoring, and administrative functions when connectivity is available. Cloud synchronisation is opportunistic — the system functions fully without it.

The end-to-end technology flow of JalMitra comprises seven sequential stages:

1. **Sense (Field Node)** — The ESP32 field node collects real-time soil moisture and micro-climate data (temperature, humidity) from the field at configurable polling intervals.
2. **Transfer** — Sensor data is transmitted to the farmer's Android device and/or backend server via Wi-Fi or GSM (SIM800L) when connectivity is available.
3. **Analyse (On-Device AI)** — The TensorFlow Lite model on the Android device analyses the received sensor data alongside crop type, soil profile, and weather forecast information, operating entirely offline.
4. **Decide** — The AI model generates a binary irrigation decision (irrigate or skip) and, if irrigation is recommended, a specific start time and duration in minutes.
5. **Act (Control Pump)** — The ESP32 controls the irrigation pump via the relay module, turning it ON or OFF based on the AI recommendation or direct farmer command, with firmware-level safety enforcement.
6. **Sync (Cloud)** — Sensor readings, pump events, and AI recommendations are synchronised to the FastAPI backend and Firebase Realtime Database when internet connectivity is restored, enabling remote monitoring and historical analysis.
7. **Impact for Farmers** — The farmer experiences reduced water wastage, lower electricity costs, less manual effort, and improved crop yield through data-informed irrigation decisions.

*Figure 4.1: High-Level System Architecture of JalMitra*

*Figure 4.2: End-to-End Technology Flow*

### 4.2 Hardware Design

The hardware architecture of the JalMitra Field Node Kit was designed with three guiding principles: low cost (total BOM under ₹1,500), retrofit compatibility (connects to any existing pump), and field reliability (continuous operation in harsh outdoor conditions). The following subsections describe each hardware component in detail.

#### 4.2.1 ESP32 Microcontroller (Espressif ESP32 DevKit V1)

The Espressif ESP32 DevKit V1 was selected as the central microcontroller for the JalMitra field node based on its exceptional integration of processing capability, wireless connectivity, and peripheral support at a unit cost of approximately ₹300–400. The ESP32 features a dual-core Xtensa LX6 processor operating at up to 240 MHz, providing sufficient computational throughput for simultaneous sensor data acquisition, local processing, safety logic enforcement, and communication management. The chip integrates 520 KB of SRAM, which is adequate for buffering sensor readings, maintaining state variables, and executing the threshold-based fallback irrigation logic.

A critical advantage of the ESP32 is its integrated wireless connectivity: IEEE 802.11 b/g/n Wi-Fi and Bluetooth 4.2/BLE are built into the System-on-Chip (SoC), eliminating the need for external wireless modules in Wi-Fi-covered deployments. The microcontroller provides 34 programmable General-Purpose Input/Output (GPIO) pins, supporting a wide range of signal types including analog input (via 12-bit ADC for soil moisture sensor), digital input/output (for DHT22 and relay control), and UART (for SIM800L GSM communication). Low-power deep sleep modes enable battery-conscious operation, drawing as little as 10 µA in deep sleep, which is relevant for future solar-powered deployments.

The GPIO allocation for JalMitra is as follows: GPIO 34 is assigned to the capacitive soil moisture sensor (analog ADC input), GPIO 4 to the DHT22 sensor (digital input), GPIO 26 to the 5V relay module (digital output), GPIO 16 and GPIO 17 to the SIM800L GSM module (UART RX/TX respectively), GPIO 2 to the onboard LED for status indication, and GPIO 0 to the manual override switch (digital input with internal pull-up resistor).

*Table 2: Hardware Component Specifications*

| Component | Model | Key Specification | Unit Cost (Approx.) |
|---|---|---|---|
| Microcontroller | ESP32 DevKit V1 | Dual-core 240 MHz, Wi-Fi + BLE, 520 KB SRAM | ₹300–400 |
| Soil Moisture Sensor | Capacitive (AM2302-compatible) | Analog output, ±3% accuracy | ₹100–150 |
| Temp/Humidity Sensor | DHT22 (AM2302) | ±0.5°C, ±2–5% RH | ₹150–200 |
| Relay Module | 5V Single-Channel | Optocoupler isolation, flyback diode | ₹50–80 |
| GSM Module | SIM800L | Quad-band GSM/GPRS, UART | ₹250–350 |
| Miscellaneous | PCB, wiring, enclosure, connectors | — | ₹200–300 |
| **Total BOM** | | | **₹1,050–1,480** |

#### 4.2.2 Capacitive Soil Moisture Sensor

The capacitive soil moisture sensor is the primary environmental sensing element of the JalMitra field node, providing continuous measurement of soil moisture content at the root zone depth. Unlike resistive soil moisture sensors — which measure moisture by passing an electrical current between two exposed metal probes inserted into the soil — the capacitive sensor operates on the principle of dielectric permittivity measurement. The sensor element consists of a sealed capacitor whose plates are embedded within a waterproof PCB substrate. As the moisture content of the surrounding soil changes, the dielectric constant of the medium between the capacitor plates changes proportionally, altering the sensor's capacitance and producing a corresponding change in the output voltage.

This capacitive design confers two significant advantages for agricultural deployment: first, the absence of exposed metal probes eliminates the electrolytic corrosion that degrades resistive sensors within weeks of field installation; second, the sealed construction provides superior resistance to the corrosive salts, organic acids, and microbial activity present in agricultural soils. The sensor produces an analog output voltage in the 0–3.3V range, which is read by the ESP32's 12-bit ADC on GPIO 34 and mapped to a calibrated 0–100% moisture scale.

Calibration of the sensor was performed for three soil types representative of the Bhilai–Durg agricultural region using the on-campus soil test bed at Rungta College of Engineering & Technology: black cotton soil (vertisol, high clay content, high water retention), loamy soil (balanced composition, moderate drainage), and red soil (laterite, low water retention, high iron content). For each soil type, calibration curves were established by correlating sensor output voltage with gravimetrically measured moisture content across the full 0–100% range. Lab validation confirmed a sensor accuracy of ±3%, which exceeds the target specification of ±5%.

#### 4.2.3 DHT22 (AM2302) Temperature and Humidity Sensor

The DHT22 (also designated AM2302) is a digital temperature and humidity sensor that communicates with the ESP32 via a single-wire digital protocol on GPIO 4. The sensor contains a capacitive humidity sensing element and a precision thermistor, with an embedded microcontroller that performs analog-to-digital conversion and transmits calibrated digital data.

The DHT22 was selected over the less expensive DHT11 based on three criteria critical to agricultural monitoring in Chhattisgarh. First, the temperature accuracy of the DHT22 (±0.5°C) is four times superior to that of the DHT11 (±2°C), enabling more precise evapotranspiration estimation. Second, the operating temperature range of the DHT22 (-40°C to +80°C) exceeds that of the DHT11 (-20°C to +60°C), which is essential given that summer temperatures in the Bhilai–Durg region regularly exceed 45°C. Third, the humidity accuracy of the DHT22 (±2–5% RH) provides a more reliable input to the irrigation decision model, as humidity is a key factor in determining atmospheric evaporative demand.

Temperature and humidity measurements serve a dual purpose in the JalMitra system. As direct inputs to the TFLite irrigation model, they contribute to the estimation of evapotranspiration rate — the combined rate of soil evaporation and plant transpiration that determines how quickly soil moisture is depleted. Additionally, temperature monitoring enables the safety logic to factor in thermal conditions: extremely high temperatures may warrant earlier irrigation to prevent crop heat stress, while unexpectedly low temperatures may indicate rainfall events that reduce irrigation need.

#### 4.2.4 SIM800L GSM Module

The SIM800L is a quad-band GSM/GPRS module manufactured by SIMCom that provides cellular connectivity for the JalMitra field node in areas where Wi-Fi infrastructure is unavailable. The module supports GSM frequencies of 850/900/1800/1900 MHz, ensuring compatibility with all Indian mobile network operators. Communication with the ESP32 is established via UART (Universal Asynchronous Receiver-Transmitter) on GPIO 16 (RX) and GPIO 17 (TX), using AT command protocol for network registration, data transmission, and SMS operations.

The inclusion of the SIM800L addresses a critical deployment constraint: many villages in Chhattisgarh lack Wi-Fi broadband infrastructure, but 2G GSM coverage — while dated — remains the most geographically widespread mobile network technology in rural India. By implementing dual-mode connectivity (Wi-Fi as primary, GSM as fallback), the JalMitra field node can transmit sensor data and receive pump control commands in virtually any location with mobile network coverage. Lab validation confirmed a GSM connectivity success rate exceeding 95% across multiple network operators in the Bhilai–Durg area.

The SIM800L module requires a dedicated power supply capable of delivering peak current bursts of up to 2A during transmission, which is managed through a decoupling capacitor and a dedicated voltage regulator in the JalMitra hardware design.

#### 4.2.5 Relay Module and Pump Control

The 5V single-channel relay module serves as the electromechanical interface between the ESP32 digital control logic and the farmer's existing irrigation pump. The relay module incorporates optocoupler isolation between the low-voltage control circuit (3.3V ESP32 GPIO on GPIO 26) and the high-voltage switching circuit (up to 250V AC / 30V DC at 10A), providing electrical isolation that protects the ESP32 from voltage spikes and transients generated by the inductive load of the pump motor.

A flyback diode (freewheeling diode) is integrated across the relay coil to suppress the inductive voltage spike generated when the relay is de-energised, preventing damage to the driving transistor and reducing electromagnetic interference. The relay's normally-open (NO) contact is wired in series with the pump motor's power circuit, ensuring that the pump defaults to the OFF state in the event of ESP32 failure or power loss — a fail-safe design choice that prevents uncontrolled pump operation.

Lab testing confirmed a relay switching reliability of 100% across all test scenarios, including rapid cycling, sustained operation, and operation under load. The relay is rated for a mechanical endurance of 100,000 cycles, which, at an average of 2–4 switching operations per day, provides a theoretical operational lifespan exceeding 50 years.

*Figure 4.3: Hardware Circuit Diagram of JalMitra Field Node Kit*

### 4.3 Software Architecture

#### 4.3.1 ESP32 Firmware

The ESP32 firmware is written in C++ using the Arduino framework, which provides a well-documented, community-supported development environment with extensive library support for the sensors and communication modules employed in JalMitra. The firmware is structured as a state machine with five primary states: INITIALISE, SENSE, TRANSMIT, CONTROL, and SLEEP.

During the INITIALISE state, the firmware configures GPIO pins, initialises sensor libraries (Adafruit DHT for the AM2302, analog read for the capacitive sensor), establishes communication with the SIM800L module, and loads safety parameters (maximum runtime limit, minimum re-irrigation gap, crop-specific moisture thresholds) from non-volatile storage (EEPROM/NVS).

The SENSE state is triggered at configurable polling intervals (default: every 10 minutes). The firmware reads the capacitive soil moisture sensor via the 12-bit ADC on GPIO 34, applies the calibration curve for the configured soil type to convert the raw ADC value to a percentage, and reads temperature and humidity from the DHT22 on GPIO 4. The readings are timestamped and stored in a circular buffer in SRAM for local processing and transmission.

In the TRANSMIT state, the firmware constructs a JSON payload containing the sensor readings, device identifier, timestamp, and pump status. If Wi-Fi connectivity is available, the payload is published to the configured MQTT topic for reception by the FastAPI backend. If Wi-Fi is unavailable, the firmware falls back to the SIM800L GSM module, transmitting the payload via GPRS HTTP POST. If neither Wi-Fi nor GSM is available, the data is retained in the local buffer for transmission when connectivity is restored.

The CONTROL state manages the relay on GPIO 26, processing pump ON/OFF commands received from the Android application (via MQTT or HTTP) or from the local threshold fallback logic. All relay state changes are subject to the safety enforcement layer, which checks the maximum runtime counter, minimum re-irrigation timer, and manual override switch state before executing any pump operation.

The SLEEP state activates the ESP32's light sleep mode between polling cycles to conserve power, waking on a timer interrupt at the next polling interval or on an external interrupt from the manual override switch on GPIO 0.

The **offline threshold fallback** is a critical firmware feature that ensures irrigation continuity when both the AI model (on the Android device) and network connectivity are unavailable. In this mode, the ESP32 compares the current soil moisture reading against a crop-specific threshold stored in non-volatile memory (e.g., 40% for paddy, 35% for maize, 30% for vegetables). If the moisture level falls below the threshold, the relay is activated for a preconfigured default duration, subject to the maximum runtime and minimum re-irrigation gap safety constraints.

#### 4.3.2 Backend — FastAPI (Python)

The JalMitra backend is built with FastAPI, a modern Python web framework chosen for four specific technical advantages. First, FastAPI's automatic generation of OpenAPI (Swagger) documentation from endpoint type annotations eliminates the need for manual API documentation maintenance. Second, its native support for asynchronous request handling (via Python's asyncio) enables efficient concurrent processing of multiple sensor data submissions from field nodes. Third, its tight integration with the Python scientific computing ecosystem (NumPy, Pandas, TensorFlow) facilitates server-side data analysis and model retraining workflows. Fourth, its lightweight resource footprint makes it suitable for deployment on low-cost cloud virtual machines or even on-premises hardware at pilot sites.

Authentication is implemented using JSON Web Tokens (JWT). Farmers and administrators authenticate via the /auth/token endpoint, receiving a signed JWT that is included in the Authorization header of subsequent API requests. Device-level authentication uses pre-shared device keys, enabling field nodes to submit sensor data without requiring interactive login.

The backend exposes the following key REST API endpoints:

- **POST /auth/token** — Authenticates a farmer or administrator user, validates credentials against the user store, and returns a signed JWT token with an expiry period.
- **GET /sensor/latest** — Retrieves the most recent sensor reading (soil moisture, temperature, humidity) from a specified field node, enabling real-time display on the Android app dashboard.
- **POST /sensor/data** — Accepts new sensor readings from the ESP32 field node, validates the payload schema, and stores the data in Firebase Realtime Database with a server-side timestamp.
- **POST /pump/control** — Receives pump ON/OFF commands from the Android application, validates user authorisation and safety constraints, and relays the command to the specified field node via MQTT or queued for GSM delivery.
- **GET /pump/logs** — Retrieves the history of pump operations for a specified field node, including action type (ON/OFF), duration, trigger source (AI, manual, threshold fallback), and timestamp.
- **GET /ai/recommend** — Generates an AI irrigation recommendation based on the latest sensor data, crop type, soil profile, and weather forecast, using either a server-side model replica or by querying the most recent on-device recommendation.

*Figure 4.6: FastAPI Backend Architecture and Endpoints*

#### 4.3.3 Android Application — React Native + Expo

The JalMitra Android application is developed using React Native with the Expo managed workflow, a technology choice driven by three practical considerations: cross-platform code reuse (enabling future iOS deployment without rewriting), rapid development iteration through Expo's hot-reload and over-the-air update capabilities, and access to Expo's pre-built native modules for camera, speech recognition, and local storage.

The application is structured around five primary screens:

**Dashboard Screen:** The default landing screen displays live sensor data — soil moisture percentage, temperature in degrees Celsius, and relative humidity — in large, colour-coded cards with Hindi labels. The AI irrigation recommendation is displayed prominently, indicating whether irrigation is advised and, if so, the recommended duration in minutes. The colour scheme uses intuitive visual cues: green for adequate moisture, yellow for approaching dry threshold, and red for critically dry conditions.

**Pump Control Screen:** Provides one-tap pump ON/OFF control with a mandatory safety confirmation dialog that prevents accidental activation. The screen displays the current pump state (ON/OFF), a running session timer when the pump is active, the elapsed time since the last irrigation, and a warning if the minimum re-irrigation gap has not been satisfied.

**Voice Assistant Screen:** Implements the Hindi/Hinglish voice interaction interface. A large microphone button activates the SpeechRecognizer API, with real-time visual feedback of speech input. The recognised text is displayed, the mapped intent is shown, and the system response is both displayed on screen and spoken aloud via TTS.

**Historical Logs Screen:** Displays a chronological record of sensor readings, pump operations, and AI recommendations, enabling the farmer and agricultural advisors to review irrigation patterns over time.

**Settings Screen:** Allows configuration of crop type, soil type, polling interval, safety parameters, and language preferences.

The entire UI is designed with a Hindi-first philosophy: all labels, buttons, notifications, and system messages are rendered in Hindi by default, with an option for Hinglish (mixed Hindi-English). Tap targets are intentionally oversized (minimum 48dp) to accommodate interaction by farmers with limited touchscreen experience. The icon-heavy design minimises reliance on text, ensuring that the application remains usable by farmers with limited literacy.

The TFLite model is embedded within the application APK and loaded at application startup. Inference is performed locally on the device using the TensorFlow Lite React Native binding, with no network requests required for AI recommendation generation.

#### 4.3.4 Firebase Realtime Database

Firebase Realtime Database serves as the cloud data store for JalMitra, providing a NoSQL, JSON-structured database with real-time synchronisation capabilities. The database is organised into four primary collections:

**sensor_readings:** Stores timestamped sensor data from field nodes. Each document contains: timestamp (Unix epoch), device_id (unique field node identifier), moisture (percentage), temperature (°C), humidity (% RH), and battery_level (optional, for future solar-powered deployments).

**pump_events:** Records all pump operations with: timestamp, device_id, action (ON/OFF), duration_seconds, triggered_by (AI_recommendation, manual_command, threshold_fallback), and moisture_at_trigger (soil moisture at the time of pump activation).

**user_settings:** Stores per-user configuration: crop_type (paddy, maize, vegetables), soil_type (black_cotton, loamy, red), max_runtime_minutes, min_gap_hours, moisture_threshold, and language_preference.

**ai_recommendations:** Archives AI model outputs with: timestamp, device_id, input_snapshot (the sensor and weather data used for inference), recommendation (irrigate/skip), duration_minutes, and confidence_score.

Firebase was selected over alternatives such as PostgreSQL or MongoDB for three reasons specific to the JalMitra use case. First, its built-in offline persistence SDK for Android enables the application to read and write data locally when offline, automatically synchronising with the cloud database when connectivity is restored — directly aligning with JalMitra's offline-first architecture. Second, real-time data synchronisation via WebSocket connections enables live dashboard updates on the Android app without polling. Third, the Firebase free tier (Spark Plan) provides sufficient read/write operations for the pilot deployment phase, minimising infrastructure costs during validation.

*Figure 4.7: Firebase Realtime Database Schema*

### 4.4 On-Device AI Module (TensorFlow Lite)

The artificial intelligence module of JalMitra is designed as an on-device inference system, operating entirely on the farmer's Android smartphone without requiring network connectivity for AI-powered irrigation recommendations. This design decision represents the core technical differentiator of JalMitra relative to cloud-dependent precision irrigation platforms.

**Model Architecture:** The TFLite model is a lightweight multi-layer perceptron (MLP) with a dual-head architecture. The classification head performs binary prediction (irrigate = 1, skip = 0) using a sigmoid activation function, while the regression head predicts the recommended irrigation duration in minutes using a linear activation function. The network comprises an input layer, two hidden layers with ReLU activation and dropout regularisation, and the two output heads. The architecture was deliberately kept shallow to minimise model size and inference latency on resource-constrained Android devices.

**Input Features:** The model accepts seven input features: (1) current soil moisture percentage, (2) soil moisture trend (slope of last 6 readings), (3) current temperature in °C, (4) current relative humidity in %, (5) crop type encoded as a categorical variable (paddy = 0, maize = 1, vegetables = 2), (6) soil type encoded as a categorical variable (black cotton = 0, loamy = 1, red soil = 2), and (7) weather forecast data (expected rainfall probability and maximum temperature for the next 24 hours, obtained from the OpenWeatherMap API when connectivity was last available, or using the most recent cached forecast when offline).

**Training Data:** The training dataset comprises 500+ labelled samples collected from field trials across three crop types and three soil types in the Bhilai–Durg district of Chhattisgarh. Each sample consists of a sensor reading snapshot (moisture, temperature, humidity, crop type, soil type, weather) paired with the ground-truth irrigation decision made by experienced farmers and agricultural advisors. The dataset was augmented with synthetic variations to improve model robustness across the observed range of environmental conditions.

**Training Procedure:** The model was trained in Python using TensorFlow/Keras with the Adam optimiser, binary cross-entropy loss for the classification head, and mean squared error loss for the regression head, using a combined weighted loss function. An 80/20 train/test split was employed. Post-training, the model was converted to TensorFlow Lite format and quantised to INT8 using post-training quantisation, reducing the model size to less than 500 KB and enabling inference latency of less than 50 milliseconds on mid-range Android devices.

**Validated Results:** On the 20% held-out test set (100+ samples), the model achieved a precision of 87%, a recall of 84%, and an F1 score of 85%. These metrics were evaluated across all three crop types and all three soil types to ensure consistent performance across the diverse agricultural conditions of Chhattisgarh. Precision of 87% indicates that when the model recommends irrigation, it is correct 87% of the time, minimising unnecessary water usage. Recall of 84% indicates that the model correctly identifies 84% of all actual irrigation-needed situations, with a false negative rate of 16% that is mitigated by the conservative firmware-level threshold fallback on the ESP32.

**Fallback Strategy:** In scenarios where the TFLite model is unavailable (e.g., application not running, device powered off), the ESP32 firmware's threshold fallback logic takes over, using simple crop-specific moisture thresholds to make basic irrigate/skip decisions. This layered approach ensures that the system never fails to provide irrigation guidance, regardless of the availability of the AI model or network connectivity.

*Figure 4.4: TensorFlow Lite On-Device AI Model Decision Flow*

*Table 4: TinyML Model Training Parameters*

| Parameter | Value |
|---|---|
| Framework | TensorFlow Lite (Python training, TFLite conversion) |
| Model Type | Multi-layer Perceptron (Binary Classification + Regression) |
| Input Features | Soil moisture (%), temperature (°C), humidity (%), crop type, soil type, time of day, weather forecast |
| Output | Irrigate (0/1) + Duration (minutes) |
| Training Dataset Size | 500+ labeled samples |
| Train/Test Split | 80% / 20% |
| Quantization | INT8 post-training quantization |
| Precision (Test Set) | 87% |
| Recall (Test Set) | 84% |
| F1 Score (Test Set) | 85% |
| Inference Latency (Android) | < 50 ms |
| Model Size (post-quantization) | < 500 KB |
| Crops Supported | Paddy/Rice, Maize, Vegetables |
| Soil Types Supported | Black cotton, Loamy, Red soil |

### 4.5 Hindi/Hinglish Voice Interaction

The voice interaction module of JalMitra is designed to provide a hands-free, literacy-independent interface for farmers to interact with the system using spoken Hindi or Hinglish commands. This module recognises that the target user base — smallholder farmers in rural Chhattisgarh — may have limited reading ability and minimal experience with touchscreen-based application interfaces, but is fully fluent in spoken Hindi.

The voice pipeline comprises three stages: speech-to-text conversion, intent recognition, and text-to-speech response.

**Speech-to-Text:** The Android SpeechRecognizer API is invoked when the farmer taps the microphone button on the Voice Assistant screen or speaks a wake phrase. The API processes the audio input using Google's on-device speech recognition model (when available) or cloud-based recognition, converting the farmer's spoken Hindi or Hinglish utterance into text. The API supports Hindi (hi-IN) as a recognised language locale, though accuracy varies with accent, speaking speed, and ambient noise conditions.

**Intent Recognition (Rule-Based NLU):** The recognised text is processed by a rule-based Natural Language Understanding (NLU) layer that maps spoken phrases to predefined system intents. Four intent categories are supported:

1. **Irrigation Query** — Triggered by phrases such as "Aaj paani dena hai?" (Should I water today?), "Sinchai zaruri hai?" (Is irrigation necessary?), or "Paani ki zarurat hai?" (Is water needed?). The system responds with the current AI recommendation, including whether irrigation is advised and the recommended duration.

2. **Pump Control** — Triggered by phrases such as "Pump chalu kardo" (Turn the pump on), "Pump band karo" (Turn the pump off), or "Motor chalu" (Start the motor). The system executes the corresponding relay command after applying safety checks and confirms the action verbally.

3. **Status Check** — Triggered by phrases such as "Kheti kaisi hai?" (How is the crop doing?), "Mitti mein paani kitna hai?" (How much water is in the soil?), or "Temperature batao" (Tell me the temperature). The system reads out the current sensor values and system status.

4. **Help** — Triggered by phrases such as "Madad chahiye" (I need help) or "Kaise use kare?" (How to use?). The system provides a brief verbal guide to the available voice commands and app features.

The rule-based approach uses keyword matching and phrase pattern recognition rather than statistical NLP models. Each intent is associated with a set of trigger keywords and phrase patterns. The NLU layer tokenises the recognised text, matches tokens against the keyword sets, and selects the highest-confidence intent. This approach was chosen over full NLP for three reasons: deterministic behaviour (critical for pump control safety), complete offline operation without cloud NLP services, and computational efficiency on low-end Android devices.

**Text-to-Speech Response:** After processing the intent and executing the corresponding action, the system generates a response in Hindi and delivers it both as on-screen text and as spoken audio using the Android TextToSpeech engine with the Hindi (hi-IN) locale. For example, in response to an irrigation query, the system might respond: "Haan, aaj sinchai ki zarurat hai. AI ka sujhav hai ki 25 minute paani dijiye." (Yes, irrigation is needed today. The AI recommends 25 minutes of watering.)

*Figure 4.5: Hindi/Hinglish Voice Interaction Flow Diagram*

### 4.6 Safety Architecture

The safety architecture of JalMitra is enforced at the ESP32 firmware level, ensuring that safety constraints are applied regardless of the state of the Android application, network connectivity, or AI model availability. Four distinct safety mechanisms are implemented:

**1. Maximum Runtime Limit:** A configurable maximum duration (default: 60 minutes per session) is enforced for every pump activation. A countdown timer is started when the relay is activated, and the relay is automatically de-energised when the timer expires, regardless of the triggering source (AI recommendation, manual command, or threshold fallback). This mechanism prevents pump motor overheating, dry-run damage (when the water source is depleted), and excessive water usage from a stuck-on condition. The maximum runtime value is stored in ESP32 non-volatile storage and is configurable via the Android app or backend API.

**2. Minimum Re-Irrigation Gap:** A configurable minimum time interval (default: 4 hours) is enforced between consecutive irrigation sessions. After a pump session ends, a lockout timer prevents the relay from being activated again until the minimum gap has elapsed. This mechanism prevents waterlogging from excessively frequent irrigation, protects soil structure and root health, and reduces electricity consumption from unnecessary pump cycles. The gap timer persists across ESP32 restarts by storing the last irrigation end-time in non-volatile memory.

**3. Offline Threshold Fallback:** When both the AI model (on the Android device) and network connectivity are unavailable — meaning the ESP32 is operating autonomously without external intelligence — the firmware reverts to a simple, deterministic moisture-threshold decision rule. For each supported crop type, a minimum acceptable soil moisture level is defined (e.g., 40% for paddy, 35% for maize, 30% for vegetables). If the current sensor reading falls below the crop-specific threshold, the relay is activated for a short, preconfigured default duration, subject to the maximum runtime and minimum gap constraints. This ensures that the crop receives basic irrigation protection even in the most degraded operating conditions.

**4. Manual Override:** A physical switch connected to GPIO 0 (configured with an internal pull-up resistor and hardware debouncing) provides the farmer with direct, unconditional control over the pump relay. Pressing the manual override switch toggles the pump state immediately, bypassing the AI recommendation, threshold logic, and software control layer. The override switch operates at the hardware interrupt level, ensuring a response time of less than 10 milliseconds. This mechanism is both a safety feature (enabling immediate pump shutdown in emergency situations such as pipe bursts or flooding) and a trust-building feature (assuring farmers that they retain full control over their equipment at all times, regardless of what the "computer" decides).

All four safety mechanisms are implemented in the ESP32 firmware's CONTROL state handler, with safety checks executed before every relay state change. The firmware logs all safety interventions (runtime limit trips, gap lockout rejections, fallback activations, manual overrides) to the local buffer for subsequent transmission to the backend, enabling system administrators to monitor safety events and adjust parameters if needed.

*Figure 4.8: Safety Architecture at ESP32 Firmware Level*

---

## Chapter 5 — Results

### 5.1 Functional Outcomes

The JalMitra system was subjected to comprehensive testing across hardware, software, AI, and field deployment dimensions. The functional outcomes of each system component are summarised below.

**Field Node Sensing:** The ESP32-based field node successfully demonstrated real-time acquisition of soil moisture, temperature, and humidity data across all three calibrated soil types (black cotton, loamy, red soil). The capacitive soil moisture sensor achieved a validated accuracy of ±3%, surpassing the design target of ±5%. The DHT22 temperature sensor achieved an accuracy of ±0.5°C, consistent with the manufacturer's specification. The SIM800L GSM module achieved a connectivity success rate exceeding 95% across multiple network operators in the Bhilai–Durg area, confirming its viability as a fallback communication channel. Continuous uninterrupted operation of the field node was verified for a duration exceeding 72 hours under laboratory conditions, with no sensor drift, communication failures, or firmware crashes observed during the test period. Power backup testing confirmed continued operation for 8+ hours on battery after mains power interruption, with data safety and fail-safe behaviour verified.

**On-Device AI Accuracy:** The TensorFlow Lite model, operating entirely on the Android device without network connectivity, achieved a precision of 87%, recall of 84%, and F1 score of 85% on a held-out test dataset of 500+ samples. The model was validated across all three supported crop types (paddy, maize, vegetables) and all three supported soil types (black cotton, loamy, red soil), confirming consistent performance across the diverse agricultural conditions of the Bhilai–Durg district. Inference latency was measured at less than 50 milliseconds on a mid-range Android device, ensuring real-time responsiveness for the farmer.

**Pump Control and Safety:** The relay module demonstrated 100% switching reliability across all test scenarios, including rapid ON/OFF cycling, sustained multi-hour operation under motor load, and operation after extended idle periods. All four safety mechanisms were tested and verified: the maximum runtime limit correctly de-energised the relay after the configured duration, the minimum re-irrigation gap correctly rejected premature pump activation requests, the threshold fallback correctly activated irrigation when moisture fell below crop-specific thresholds in the absence of AI and network, and the manual override switch correctly toggled the pump state with sub-10ms response time.

**Offline Operation:** The complete JalMitra system was tested in a fully offline configuration — no Wi-Fi, no GSM, no internet connectivity of any kind. Under these conditions, the TFLite model on the Android device continued to generate irrigation recommendations from locally cached sensor data, and the ESP32 threshold fallback correctly managed pump operations based on real-time sensor readings. Offline operation reliability was measured at 100%, confirming that JalMitra's core functionality — sensing, decision-making, and pump control — is fully independent of network connectivity.

### 5.2 Performance Metrics

The quantitative performance of JalMitra is summarised in Table 5, comparing target specifications established during the design phase with the achieved values measured during testing.

*Table 5: Performance Metrics — Target vs Achieved*

| Metric | Target | Achieved |
|---|---|---|
| Soil Moisture Sensor Accuracy | ±5% | ±3% |
| DHT22 Temperature Accuracy | ±1.0°C | ±0.5°C |
| Relay Switching Reliability | >95% | 100% |
| GSM Connectivity Success Rate | >90% | >95% |
| TFLite Model Precision | >80% | 87% |
| TFLite Model Recall | >80% | 84% |
| TFLite Model F1 Score | >80% | 85% |
| Continuous Run Test | >48 hours | 72+ hours |
| Offline Operation | 100% | 100% |
| Power Backup | >6 hours | 8+ hours |
| Water Usage Reduction (Field Trial) | >15% | ~22% |
| Electricity Usage Reduction | >10% | ~18% |
| Time Saved per Day | >20 min | ~30 min |
| Yield Improvement (Trial Plots) | >5% | 8–12%* |

*Early trend from trial plots; long-term seasonal validation is ongoing.

The results demonstrate that JalMitra met or exceeded all design targets across every measured dimension. Particularly noteworthy is the sensor accuracy performance (±3% vs ±5% target), the relay reliability (100% vs >95% target), and the AI model metrics (87%/84%/85% precision/recall/F1 vs >80% target), which collectively indicate that the system provides reliable, accurate irrigation intelligence under real-world conditions.

### 5.3 AI Model Performance

The TensorFlow Lite on-device AI model was evaluated rigorously on a held-out test dataset to ensure that irrigation recommendations are accurate, reliable, and consistent across the diverse agricultural conditions of Chhattisgarh.

**Dataset Composition:** The evaluation dataset comprised 500+ labelled samples collected from field trials and controlled experiments across three crop types (paddy/rice, maize, vegetables) and three soil types (black cotton, loamy, red soil). Each sample consisted of a feature vector (soil moisture percentage, temperature, humidity, crop type, soil type, time of day, weather forecast) paired with a ground-truth irrigation label (irrigate/skip) and, for positive samples, the actual irrigation duration applied by experienced farmers.

**Training and Evaluation Protocol:** The dataset was split 80/20 into training and test sets, with stratification to ensure proportional representation of all crop-soil combinations in both sets. The model was trained on the 80% training set and evaluated on the 20% held-out test set. No test set samples were used during training or hyperparameter tuning, ensuring an unbiased evaluation of generalisation performance.

**Classification Metrics:**

*Table 6: AI Model Validation Results*

| Metric | Value |
|---|---|
| Precision | 87% |
| Recall | 84% |
| F1 Score | 85% |
| Test Dataset Size | 500+ samples |
| Crop Types Evaluated | Paddy/Rice, Maize, Vegetables |
| Soil Types Evaluated | Black cotton, Loamy, Red soil |
| Inference Mode | Fully on-device (TFLite, offline) |

**Confusion Matrix Analysis:** The confusion matrix for the binary irrigation classification reveals the distribution of model predictions relative to ground truth. True Positives (TP) represent cases where the model correctly recommended irrigation when irrigation was indeed needed — these constitute the largest category, reflecting the model's ability to detect moisture deficits and evapotranspiration-driven irrigation needs. True Negatives (TN) represent cases where the model correctly recommended skipping irrigation when soil moisture was adequate — preventing unnecessary water and electricity consumption. False Positives (FP) represent cases where the model recommended irrigation when it was not needed — resulting in modest water wastage but no crop harm, as slight over-irrigation is agronomically tolerable. False Negatives (FN) represent cases where the model failed to recommend irrigation when it was needed — potentially resulting in crop stress. The FN rate of 16% (complement of 84% recall) is mitigated by the ESP32's threshold fallback mechanism, which independently monitors soil moisture and activates the pump if levels drop to critically low values, even when the AI model has not issued a recommendation.

The model's performance was found to be consistent across crop types, with no statistically significant variation in precision or recall between paddy, maize, and vegetable classifications. Performance across soil types showed minor variation, with loamy soil predictions exhibiting slightly higher accuracy than black cotton and red soil, attributed to the more linear moisture-voltage characteristic of loamy soil that simplifies the sensor calibration mapping.

It is noted that offline AI performance is identical to online performance, as the TFLite model runs entirely on the Android device and does not rely on cloud-based inference. This characteristic is a fundamental design requirement for JalMitra, ensuring that farmers in zero-connectivity areas receive the same quality of AI recommendation as those with broadband access.

*Figure 5.5: AI Model Confusion Matrix*

### 5.4 Field Trials and Market Validation

**Field Trial Results:** JalMitra was deployed for field trials across 6+ villages in the Bhilai–Durg district of Chhattisgarh, involving 25+ participating farmers cultivating paddy, maize, and vegetables. The trials were conducted over multiple irrigation cycles to evaluate system performance under real-world agricultural conditions.

Key observations from the field trials are as follows:

- The system operated efficiently in low-network areas, with the SIM800L GSM module providing reliable connectivity where Wi-Fi was unavailable and the offline threshold fallback ensuring uninterrupted operation during complete connectivity outages.
- AI-generated irrigation recommendations reduced the frequency of unnecessary irrigations compared to the farmers' traditional guesswork-based schedules. Farmers reported that the system helped them avoid both over-irrigation (which they had previously identified by waterlogged patches) and under-irrigation (identified by crop stress symptoms).
- Average water usage across trial plots was reduced by approximately 22% compared to control plots managed using the farmers' traditional irrigation practices. This reduction was accompanied by an estimated electricity savings of approximately 18% (attributable to reduced pump runtime) and daily time savings of approximately 30 minutes (attributable to elimination of manual soil inspection visits and reduced pump monitoring time).
- Early yield data from trial plots indicated an improvement of 8–12% compared to control plots, though this result is characterised as an early trend requiring long-term seasonal validation across multiple crop cycles for statistical confirmation.
- Farmers consistently reported that the Android application was simple and easy to use, with the Hindi-language interface and voice interaction feature being highlighted as particularly useful. Several farmers noted that the voice command feature allowed them to check irrigation status and control the pump while engaged in other farming activities, without needing to stop and operate the touchscreen.

*Table 7: Field Trial Impact Summary*

| Impact Metric | Result |
|---|---|
| Villages Covered | 6+ |
| Farmers Involved | 25+ |
| Crops Tested | Paddy, Maize, Vegetables |
| Water Usage Reduction | ~22% |
| Electricity Usage Reduction | ~18% |
| Time Saved per Day | ~30 minutes |
| Yield Improvement (Early Trend) | 8–12%* |

*Early trend from trial plots; long-term seasonal validation is planned.

**Market Validation Results:** A comprehensive market study was conducted to assess the adoption potential of JalMitra among the target user base. The study encompassed surveys of 150+ farmers across the Bhilai–Durg district and 8 structured focus group discussions with farmer groups of varying sizes, crop types, and landholding categories.

The survey results revealed that 78% of respondents expressed strong interest in adopting a smart irrigation assistance device, provided it met their stated requirements of affordability, Hindi-language support, and compatibility with their existing pump infrastructure. The primary pain point identified by the majority of respondents was the uncertainty of irrigation timing — farmers consistently reported difficulty in determining when and how long to irrigate, particularly during transitional weather periods between seasons.

The most frequently requested features were: (1) a simple Hindi-language application with voice support, (2) an affordable device that works with the existing pump, (3) reliable operation in areas with poor internet connectivity, and (4) clear, actionable recommendations rather than complex data displays. The willingness to pay for a field node kit was consistently reported in the range of ₹1,500–₹2,000, which aligns closely with JalMitra's target Average Selling Price of ₹1,800.

A representative farmer quote from the Durg District encapsulates the sentiment expressed across multiple focus groups: *"Paani kab dena hai, ye samajhna mushkil bota hai. Agar aapka system sahi batata hai, hum zaroor use karenge."* (It is difficult to understand when to give water. If your system tells us correctly, we will definitely use it.)

*Figure 5.4: Verification Result — Field Trial Water Usage Comparison*

### 5.5 User Interface Results

The JalMitra Android application was evaluated for usability, visual clarity, and functional completeness through a combination of laboratory testing and farmer feedback during field trials. The following paragraphs describe the key application screens and their observed performance.

*Figure 5.1: JalMitra Android App — Dashboard Screen*

The Dashboard Screen serves as the primary information display for the farmer, presenting live sensor data and AI recommendations in a format designed for rapid comprehension. Soil moisture percentage is displayed as a large, colour-coded numerical value (green: adequate, yellow: approaching threshold, red: critically dry), accompanied by temperature and humidity readings in equally prominent cards. The AI irrigation recommendation is displayed below the sensor data, clearly stating whether irrigation is advised and, if so, the recommended duration in minutes. All labels are rendered in Hindi, with large font sizes (minimum 18sp) for readability in outdoor sunlight conditions. Farmer feedback confirmed that the dashboard layout was intuitive and easy to interpret, with one participant noting that "even my father, who has never used an app, could understand the moisture reading."

*Figure 5.2: JalMitra Android App — Pump Control Screen*

The Pump Control Screen provides one-tap pump activation and deactivation with a mandatory safety confirmation dialog. The current pump state (ON or OFF) is displayed as a large toggle indicator. When the pump is active, a running session timer displays the elapsed duration, and the maximum runtime remaining is shown as a countdown. The timestamp of the last irrigation session is displayed to help the farmer assess whether the minimum re-irrigation gap has been satisfied. The safety confirmation dialog requires the farmer to explicitly confirm pump activation, preventing accidental triggering. Field trial farmers reported that the one-tap control was a significant improvement over their traditional process of physically walking to the pump house to toggle the switch.

*Figure 5.3: JalMitra Android App — Voice Assistant Interaction*

The Voice Assistant screen enables complete hands-free interaction with the JalMitra system. A large microphone button occupies the centre of the screen, with a visual speech waveform animation providing real-time feedback during voice input. Upon recognition, the transcribed Hindi text is displayed, the detected intent is shown, and the system response is presented both as on-screen text and as spoken audio. An example interaction flow: the farmer taps the microphone and says "Aaj paani dena hai?" (Should I water today?); the system recognises the irrigation query intent, retrieves the latest AI recommendation, and responds verbally: "Ji haan, AI ke mutabik aaj 20 minute paani dena chahiye. Mitti mein nami 35% hai." (Yes, according to AI, you should water for 20 minutes today. Soil moisture is at 35%.) Farmers reported that the voice feature was "the best part" of the application, enabling them to interact with the system while their hands were occupied with farming tools or while walking through the field.

---

## Chapter 6 — Conclusion and Future Scope

### 6.1 Conclusion

The JalMitra project demonstrates that precision agriculture technology need not be expensive, complex, or connectivity-dependent to be effective for smallholder farmers. By integrating a low-cost ESP32-based IoT field node (estimated BOM cost ₹1,350, average selling price ₹1,800), an on-device TensorFlow Lite AI model operating fully offline on the farmer's Android phone, a Hindi/Hinglish voice interface via the Android SpeechRecognizer API, and a relay-based pump control system with firmware-enforced safety mechanisms, JalMitra delivers verifiable irrigation intelligence to farmers who previously relied entirely on guesswork and inherited practice.

The system's three-product architecture — Field Node Kit, Android App, and AI + Backend Intelligence — addresses the complete irrigation decision workflow from sensing to actuation, while the dual-mode connectivity (Wi-Fi + GSM via SIM800L) and layered fallback strategy (AI → threshold → manual override) ensure operational continuity across the full spectrum of connectivity conditions encountered in rural Chhattisgarh.

Quantitative validation confirms that JalMitra meets or exceeds all design specifications. The capacitive soil moisture sensor achieved ±3% accuracy against a ±5% target. The DHT22 temperature sensor achieved ±0.5°C accuracy. The relay switching reliability was measured at 100%. The TFLite AI model achieved a precision of 87%, recall of 84%, and F1 score of 85% on a 500+ sample Chhattisgarh-specific test dataset. Continuous hardware operation was verified for 72+ hours with 8+ hours of power backup and 100% offline operation reliability.

Field trials across 6+ villages involving 25+ farmers recorded an average water usage reduction of approximately 22%, electricity savings of approximately 18%, daily time savings of approximately 30 minutes, and an early yield improvement trend of 8–12% on trial plots. A comprehensive market study of 150+ farmers and 8 focus group discussions confirmed that 78% of respondents expressed strong adoption interest, with willingness to pay aligning at ₹1,500–₹2,000 — precisely the price range at which JalMitra is positioned.

These results collectively affirm the core thesis of the project: that an offline-first, Hindi-first, safety-first design philosophy is the correct approach for bringing precision irrigation technology to underserved smallholder farming communities in India. JalMitra is not competing with enterprise irrigation platforms designed for large-scale commercial farms; it is addressing a fundamentally different market — the 130 million small and marginal farm holdings that have been left behind by the current generation of agricultural technology.

### 6.2 Future Work

The following directions are identified for the continued development and scaling of JalMitra beyond the current minor project scope:

1. **Solar-Powered Field Node:** Integration of a compact solar panel and lithium-polymer battery management system (BMS) with the ESP32 field node to eliminate dependence on grid electricity for field node operation. This enhancement would enable deployment in remote field locations where mains power is unavailable, leveraging the ESP32's low-power deep-sleep modes to achieve continuous solar-powered operation.

2. **Multi-Crop AI Model Expansion:** Expanding the TFLite model's training dataset and crop-specific calibration to support pulses, soybean, cotton, and wheat — the other major crops cultivated in Chhattisgarh. This expansion would require field data collection across additional soil-crop combinations and retraining of the model with an augmented feature set that captures the distinct irrigation profiles of each new crop type.

3. **Government Scheme Integration:** Linking JalMitra field data and impact metrics with government agricultural programs, specifically the Pradhan Mantri Krishi Sinchai Yojana (PMKSY) for irrigation infrastructure subsidies and the Krishi Vigyan Kendra (KVK) network for extension and training services. This integration would facilitate subsidised deployment for below-poverty-line farmers and enable impact reporting to state and central agricultural departments.

4. **Regional Language Expansion:** Extending the voice interaction module beyond Hindi and Hinglish to support Chhattisgarhi (spoken in central Chhattisgarh), Odia (spoken in eastern border districts adjacent to Odisha), and Marathi (spoken in southern border districts adjacent to Maharashtra). This would require expanding the NLU keyword and phrase pattern databases for each language and validating the Android SpeechRecognizer API's accuracy for these additional locales.

5. **Scale to 50+ Farms and FPO Partnerships:** Completing long-term seasonal validation across multiple crop cycles to statistically confirm the early yield improvement trends observed in initial trials, refining the AI model with additional field data from diverse agro-climatic zones, and establishing partnerships with local Farmer Producer Organisations (FPOs) for cluster-based deployment that leverages group purchasing, shared maintenance, and collective data contribution to continuously improve the AI model's accuracy and coverage.

---

## BIBLIOGRAPHY

[1] A. Banks and R. Gupta, "MQTT Version 5.0," OASIS Standard, 07 March 2019. [Online]. Available: https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html

[2] R. T. Fielding, "Architectural Styles and the Design of Network-Based Software Architectures," Doctoral dissertation, University of California, Irvine, 2000.

[3] M. A. Fourati, W. Chebbi, A. Kamoun, B. Hamouda, and V. Manikandan, "Smart Irrigation System Using Internet of Things and Soil Moisture Sensors: A Comprehensive Review," *IEEE Access*, vol. 10, pp. 52843–52862, 2022.

[4] V. Janapa Reddi, B. Plancher, S. Kennedy, L. Moroney, P. Warden, and A. Raj, "TinyML for Sustainable Agriculture: Opportunities and Challenges in Resource-Constrained Environments," *Proceedings of Machine Learning and Systems (MLSys)*, vol. 4, pp. 1–16, 2022.

[5] A. Vashistha, E. Cutrell, G. Borriello, and W. Thies, "Sangeet Swara: A Community-Moderated Voice Forum in Rural India," *Proceedings of the ACM Conference on Human Factors in Computing Systems (CHI)*, pp. 417–426, 2015.

[6] R. Sharma, S. S. Kamble, A. Gunasekaran, V. Kumar, and A. Kumar, "On-Device Machine Learning for Offline Agricultural Decision Support Systems in Developing Economies," *Computers and Electronics in Agriculture*, vol. 198, pp. 107049, 2022.

[7] S. Rawal, "Precision Irrigation Scheduling Using IoT-Based Sensor Fusion and Machine Learning: An Indian Perspective," *Journal of Agricultural Engineering (ISAE)*, vol. 58, no. 4, pp. 12–24, 2021.

[8] Espressif Systems, "ESP32 Technical Reference Manual," Version 4.6, 2023. [Online]. Available: https://www.espressif.com/sites/default/files/documentation/esp32_technical_reference_manual_en.pdf

[9] Google, "TensorFlow Lite — Deploy Machine Learning Models on Mobile and Edge Devices," 2024. [Online]. Available: https://www.tensorflow.org/lite

[10] Google, "Firebase Realtime Database Documentation," 2024. [Online]. Available: https://firebase.google.com/docs/database

[11] Meta Platforms and Expo, "React Native Documentation," 2024. [Online]. Available: https://reactnative.dev/docs/getting-started; Expo Documentation, 2024. [Online]. Available: https://docs.expo.dev

[12] Indian Council of Agricultural Research (ICAR), "Water Use Efficiency in Indian Agriculture: Status and Strategies for Improvement," ICAR Technical Bulletin, New Delhi, India, 2020.

---

## APPENDIX A — Key API Endpoints

*Table 8: Key API Endpoints*

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | /auth/token | Authenticate farmer/admin user and return JWT token | No |
| GET | /sensor/latest | Retrieve the latest sensor readings from the field node | Yes |
| POST | /sensor/data | Submit new sensor reading from ESP32 field node | Yes (device key) |
| POST | /pump/control | Send ON/OFF command to pump relay via ESP32 | Yes |
| GET | /pump/logs | Retrieve pump operation history and session durations | Yes |
| GET | /ai/recommend | Get AI irrigation recommendation based on latest sensor data | Yes |
| GET | /audit/logs | Retrieve full system audit log for admin | Yes (admin) |
| POST | /user/register | Register a new farmer user account | No |

---

## APPENDIX B — TinyML Model Training Parameters

| Parameter | Value |
|---|---|
| Framework | TensorFlow Lite (Python training, TFLite conversion) |
| Model Type | Multi-layer Perceptron (Binary Classification + Regression) |
| Input Features | Soil moisture (%), temperature (°C), humidity (%), crop type, soil type, time of day, weather forecast |
| Output | Irrigate (0/1) + Duration (minutes) |
| Training Dataset Size | 500+ labeled samples |
| Train/Test Split | 80% / 20% |
| Quantization | INT8 post-training quantization |
| Precision (Test Set) | 87% |
| Recall (Test Set) | 84% |
| F1 Score (Test Set) | 85% |
| Inference Latency (Android) | < 50 ms |
| Model Size (post-quantization) | < 500 KB |
| Crops Supported | Paddy/Rice, Maize, Vegetables |
| Soil Types Supported | Black cotton, Loamy, Red soil |

---

## APPENDIX C — ESP32 Pin Configuration Table

*Table 3: ESP32 Pin Configuration*

| GPIO Pin | Component | Signal Type | Function |
|---|---|---|---|
| GPIO 34 | Capacitive Soil Moisture Sensor | Analog Input (ADC) | Reads soil moisture voltage |
| GPIO 4 | DHT22 (AM2302) | Digital Input | Reads temperature and humidity |
| GPIO 26 | 5V Relay Module | Digital Output | Controls pump ON/OFF via relay |
| GPIO 16 | SIM800L GSM (RX) | UART RX | Receives data from GSM module |
| GPIO 17 | SIM800L GSM (TX) | UART TX | Sends data to GSM module |
| GPIO 2 | Onboard LED | Digital Output | Status indicator (Wi-Fi, GSM, pump state) |
| GPIO 0 | Manual Override Switch | Digital Input (Pull-up) | Farmer physical override input |
| 3.3V | DHT22 VCC | Power | Sensor power supply |
| 5V | Relay VCC | Power | Relay coil power supply |
| GND | All components | Ground | Common ground reference |
