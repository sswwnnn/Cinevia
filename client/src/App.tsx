import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MovieDetail from "@/pages/movie-detail";
import ProfilePage from "@/pages/profile-page";
import ProfileEditPage from "@/pages/profile-edit-page";
import MoviesPage from "@/pages/movies-page";
import TvShowsPage from "@/pages/tv-shows-page";
import PeoplePage from "@/pages/people-page";
import SearchResults from "@/pages/search-results";
import PersonDetail from "@/pages/person-detail";
import ForYouPage from "@/pages/for-you-page";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import OnboardingScreen from "./components/OnboardingScreen";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Switch>
          <Route path="/">
            <HomePage />
          </Route>
          <Route path="/auth">
            <AuthPage />
          </Route>
          <Route path="/movie/:id">
            <MovieDetail />
          </Route>
          <Route path="/profile/:username">
            <ProfilePage />
          </Route>
          <Route path="/profile/:username/favorites">
            <ProfilePage defaultTab="favorites" />
          </Route>
          <Route path="/profile/:username/reviews">
            <ProfilePage defaultTab="diary" />
          </Route>
          <Route path="/profile/edit">
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          </Route>
          <Route path="/movies/:category?">
            <MoviesPage />
          </Route>
          <Route path="/tv/:category?">
            <TvShowsPage />
          </Route>
          <Route path="/people">
            <PeoplePage />
          </Route>
          <Route path="/person/:id">
            <PersonDetail />
          </Route>
          <Route path="/for-you">
            <ForYouPage />
          </Route>
          <Route path="/search">
            <SearchResults />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
      <Footer />
      <OnboardingScreen />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
