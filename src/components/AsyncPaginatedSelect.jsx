// components/AsyncPaginatedSelect.jsx
import React, { useState } from 'react';
import Select from 'react-select';
import debounce from 'lodash/debounce';

const AsyncPaginatedSelect = ({
  value,
  onChange,
  fetchOptions,
  defaultOptions = [],
  placeholder = 'Tanlang...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadOptions = async (input, page) => {
    setIsLoading(true);
    try {
      const newOptions = await fetchOptions(input, page);
      setHasMore(newOptions.length >= 10);
      return newOptions;
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedLoadOptions = debounce(async (input, page) => {
    const newOptions = await loadOptions(input, page);
    if (page === 1) {
      setOptions(newOptions);
    } else {
      setOptions(prev => [...prev, ...newOptions]);
    }
  }, 500);

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
    setPage(1);
    debouncedLoadOptions(newValue, 1);
  };

  const handleMenuScrollToBottom = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      debouncedLoadOptions(inputValue, nextPage);
    }
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      isLoading={isLoading}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      placeholder={placeholder}
      noOptionsMessage={() => inputValue ? "Natija topilmadi" : "Qidirish uchun yozing..."}
      loadingMessage={() => "Yuklanmoqda..."}
      isSearchable
      isClearable
    />
  );
};

export default AsyncPaginatedSelect;