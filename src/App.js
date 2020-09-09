import React, {
  Suspense,
  useState,
  unstable_useTransition,
  useEffect
} from "react";
import "./styles.css";
import { ReactQueryConfigProvider, useQuery, queryCache } from "react-query";
import axios, { CancelToken } from "axios";
import { ReactQueryDevtools } from "react-query-devtools";

const Item = ({ id }) => {
  const { data, isIdle } = useQuery(
    ["pokemon", { id }],
    async (key, { id }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data } = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${id}`
      );
      return data;
    },
    {
      onSuccess: data => {
        console.log(data);
      },
      // condition if true query will run
      enabled: id,
      // set time of fresh query
      staleTime: 1000 * 60 * 5,
      // time the query saved in cache
      cacheTime: Infinity,
      // refetch query on re-focus
      refetchOnWindowFocus: false,
      /* set initial data - first time enter the component it will refetch again
      initialStale: true,
      initialData: {
        sprites: {
          front_default:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png"
        }
      },
*/
      // refetch interval
      refetchInterval: 1000 * 60,
      // refetch on backgroand
      refetchIntervalInBackground: false,
      // retry times
      retry: 3,
      // retry delay between each retry - max 30s
      retryDelay: idx => Math.min(1000 * 2 ** idx, 30000),
      // use suspense
      suspense: true
    }
  );

  console.log("queryCache: ", queryCache.getQueryData("pokemons"));
  return isIdle ? null : (
    <div style={{ width: 300, height: 250 }} className="img-container">
      <img src={data.sprites.front_default} alt={data.name} />
    </div>
  );
};
const List = () => {
  const [id, setId] = useState(null);
  const [startTransition, isPending] = unstable_useTransition({
    timeoutMs: 10000
  });
  // prefetch data before it mounts to screen
  useEffect(() => {
    queryCache.prefetchQuery(
      ["pokemon", { id: "bulbasaur" }],
      async () => {
        const { data } = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/bulbasaur`
        );
        return data;
      },
      {
        staleTime: 1000 * 60 * 5
      }
    );
  }, []);

  const { data, isFetching } = useQuery(
    "pokemons",
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const source = CancelToken.source();
      const { data } = await axios.get("https://pokeapi.co/api/v2/pokemon", {
        cancelToken: source.token
      });
      return data;
    },
    {
      suspense: true
    }
  );

  return (
    <ul className="list">
      {isFetching && "..."}
      {isPending && "pending"}
      <Suspense fallback={"loading=Item"}>
        <Item id={id} />
      </Suspense>

      {data.results.map(item => (
        <li
          onClick={() =>
            startTransition(() => {
              setId(item.name);
            })
          }
          key={item.name}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
};

const Loader = () => <div>Loading</div>;

const queryConfig = {
  suspense: true
};

export default function App() {
  const [show, setShow] = useState(true);
  return (
    <ReactQueryConfigProvider config={queryConfig}>
      <div className="App">
        <h1>Hello CodeSandbox</h1>
        <div style={{ display: "flex" }}>
          <button onClick={() => setShow(prev => !prev)}>show list</button>
          <button
            onClick={() =>
              queryCache.invalidateQueries("pokemons", {
                // on click query will refetch even if its not in the dom
                refetchInactive: true
              })
            }
          >
            refetch list
          </button>
        </div>
        <Suspense fallback={<Loader />}>{show && <List />}</Suspense>
      </div>
      <ReactQueryDevtools />
    </ReactQueryConfigProvider>
  );
}
