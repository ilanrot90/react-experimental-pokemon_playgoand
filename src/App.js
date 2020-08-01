import React, { Suspense, useState, unstable_useTransition } from "react";
import "./styles.css";
import { ReactQueryConfigProvider, useQuery } from "react-query";
import axios, { CancelToken } from "axios";

const Item = ({ id }) => {
  const { data } = useQuery(
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
      suspense: true
    }
  );

  return (
    <div style={{ width: 300, height: 250 }} className="img-container">
      <img src={data.sprites.front_default} alt={data.name} />
      {/* {data.base_experience} */}
    </div>
  );
};
const List = () => {
  const [id, setId] = useState(null);
  const [startTransition, isPending] = unstable_useTransition({
    timeoutMs: 10000
  });
  const { data } = useQuery(
    "fetch",
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
      {isPending && "pending"}
      <Suspense fallback={"loading=Item"}>{id && <Item id={id} />}</Suspense>

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
        <button onClick={() => setShow(prev => !prev)}>show list</button>
        <Suspense fallback={<Loader />}>{show && <List />}</Suspense>
      </div>
    </ReactQueryConfigProvider>
  );
}
