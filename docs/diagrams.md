# Diagramas Mermaid — DirHub

A continuación se incluyen los diagramas Mermaid principales usados en la especificación.

## Arquitectura General

```mermaid
graph TB
    subgraph "Capa de Presentación"
        Browser["Navegador del Usuario"]
        PWA["Progressive Web App"]
    end
    
    subgraph "Capa de Aplicación - Next.js"
        AppRouter["App Router"]
        ServerComponents["Server Components"]
        ClientComponents["Client Components"]
        APILayer["API Layer / Backend"]
    end
    
    subgraph "Capa de Componentes"
        Layout["Layout Components"]
        Pages["Page Components"]
        UIComponents["UI Components"]
        FeatureComponents["Feature Components"]
    end
    
    subgraph "Capa de Servicios Frontend"
        StateManagement["State Management"]
        DataFetching["Data Fetching"]
        Routing["Routing"]
        ErrorHandling["Error Handling"]
    end
    
    Browser --> PWA
    PWA --> AppRouter
    AppRouter --> ServerComponents
    AppRouter --> ClientComponents
    ServerComponents --> APILayer
    ClientComponents --> APILayer
    
    ServerComponents --> Layout
    ClientComponents --> Layout
    Layout --> Pages
    Pages --> UIComponents
    Pages --> FeatureComponents
    
    ClientComponents --> StateManagement
    ClientComponents --> DataFetching
    AppRouter --> Routing
    ClientComponents --> ErrorHandling
    
    FeatureComponents --> StateManagement
    FeatureComponents --> DataFetching
    UIComponents --> FeatureComponents
    Pages --> UIComponents
```

## Flujo de Navegación de Usuario

```mermaid
flowchart TD
    Start["Usuario Accede a DirHub"] --> HomePage["Página de Inicio"]
    HomePage --> SearchRepo["Buscar Repositorio"]
    HomePage --> ViewList["Ver Lista de Repos"]
    HomePage --> AddRepo["Agregar Repositorio"]
    HomePage --> ViewQueue["Ver Cola de Procesamiento"]
    
    SearchRepo --> ValidateInput{"¿Input Válido?"}
    ValidateInput -->|Sí| CheckExists{"¿Repo Existe?"}
    ValidateInput -->|No| ShowError["Mostrar Error de Validación"]
    ShowError --> SearchRepo
    
    CheckExists -->|Sí| WikiPage["Página de Wiki"]
    CheckExists -->|No| AddRepoForm["Formulario Agregar Repo"]
    
    ViewList --> RepoList["Lista de Repositorios"]
    RepoList --> SelectRepo["Seleccionar Repositorio"]
    SelectRepo --> WikiPage
    
    AddRepo --> AddRepoForm
    AddRepoForm --> SubmitRepo["Enviar Repositorio"]
    SubmitRepo --> ProcessingQueue["Cola de Procesamiento"]
    
    ViewQueue --> QueuePage["Página de Cola"]
    QueuePage --> MonitorStatus["Monitorear Estado"]
    MonitorStatus --> WikiPage
    
    WikiPage --> ExploreContent["Explorar Contenido"]
    ExploreContent --> ExpandCollapse["Expandir/Colapsar Secciones"]
    ExploreContent --> ViewCode["Ver Código en GitHub"]
    ExploreContent --> NavigateFolders["Navegar Carpetas"]
```

## Diagrama de Componentes

```mermaid
graph TD
    subgraph "Root Layout"
        RootLayout["RootLayout Component"]
        GlobalStyles["Global Styles"]
        Metadata["Metadata Configuration"]
    end
    
    subgraph "Navigation Layer"
        NavBar["NavBar Component"]
        MobileMenu["Mobile Menu Sheet"]
        DesktopMenu["Desktop Navigation Menu"]
        ScrollBehavior["Scroll Hide/Show Logic"]
    end
    
    subgraph "Page Components"
        HomePage["Home Page"]
        RepoListPage["Repository List Page"]
        AddRepoPage["Add Repository Page"]
        QueuePage["Queue Page"]
        WikiPage["Wiki Page"]
    end
    
    subgraph "Feature Components"
        SearchBar["Search Bar"]
        RepoCard["Repository Card"]
        QueueMonitor["Queue Monitor"]
        WikiContent["Wiki Content Display"]
    end
    
    subgraph "UI Components"
        Card["Card"]
        Button["Button"]
        Input["Input"]
        Sheet["Sheet/Drawer"]
        Separator["Separator"]
        Badge["Badge"]
        Skeleton["Skeleton Loader"]
        NavigationMenu["Navigation Menu"]
    end
    
    RootLayout --> GlobalStyles
    RootLayout --> Metadata
    RootLayout --> NavBar
    
    NavBar --> MobileMenu
    NavBar --> DesktopMenu
    NavBar --> ScrollBehavior
    
    RootLayout --> HomePage
    RootLayout --> RepoListPage
    RootLayout --> AddRepoPage
    RootLayout --> QueuePage
    RootLayout --> WikiPage
    
    HomePage --> SearchBar
    RepoListPage --> RepoCard
    QueuePage --> QueueMonitor
    WikiPage --> WikiContent
    
    SearchBar --> Input
    SearchBar --> Button
    RepoCard --> Card
    RepoCard --> Badge
    RepoCard --> Separator
    
    WikiContent --> MarkdownRenderer
    MarkdownRenderer --> CollapsibleHeader
    MarkdownRenderer --> CodeBlock
    MarkdownRenderer --> LinkComponent

```